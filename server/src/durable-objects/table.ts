import { corsHeaders } from "@/middleware";

export type TableAction = 'join' | 'connect';

interface Person {
    name: string
}

export interface Connection {
    socket: WebSocket
    person: Person
}

export class Table implements DurableObject {
    connections: Record<string, Connection>;

    constructor(private readonly state: DurableObjectState, private readonly env: Bindings) {
        this.state = state;
        this.env = env;

        this.connections = {};
    }

    async fetch(request: Request) {
        const searchParams = new URLSearchParams(new URL(request.url).search);
        const action = searchParams.get('action') as TableAction;

        switch (action) {
            case 'join': {
                const name = searchParams.get('name')!;
                // ensure noone has this name already
                if (this.connections[name]) {
                    return new Response(JSON.stringify("choose another name"), { status: 400 });
                }
                // create token
                const token = crypto.randomUUID();
                // associate it with the name we get
                const value = JSON.stringify({ name } as Person);
                await this.state.storage.put(token, value);
                // let the client know our token
                return new Response(token, { status: 201 });
            } break;

            case 'connect': {
                // consume token
                const token = searchParams.get('token')!;
                const joinerName = await this.state.storage.get(token)
                    .then(data => {
                        const name = data as string;
                        return JSON.parse(name) as Person
                    })

                // create websocket pair for this client
                const [client, server] = Object.values(new WebSocketPair());

                await this.handleSession(server, joinerName);

                // consume this token so it can't be re-used
                this.state.storage.delete(token);

                return new Response(null, {
                    status: 101,
                    headers: {
                        'Content-type': 'application/json',
                        ...corsHeaders(this.env)
                    },
                    webSocket: client
                });
            } break;
        }
    }

    private handleSession(socket: WebSocket, joiner: Person) {
        socket.accept();

        // tell people already at the table that this person joined
        const actionId = crypto.randomUUID();
        this.sendToAll({ action: "join", name: joiner.name, id: actionId, subtext: `${joiner.name} joined` });

        const connection = {
            socket,
            person: joiner
        };
        this.connections[joiner.name] = connection;

        socket.addEventListener("message", async event => {
            if (!this.connections[joiner.name]) {
                console.log(`No connection data found for name ${joiner.name}`);
                return;
            };

            this.processMessage(this.connections[joiner.name], event);
        });

        // On "close" and "error" events, remove the WebSocket from the sessions list and broadcast
        // a quit message.
        let closeOrErrorHandler = (event: CloseEvent | MessageEvent | Event) => {
            this.removePerson(joiner, socket);
        };
        socket.addEventListener("close", closeOrErrorHandler);
        socket.addEventListener("error", closeOrErrorHandler);
    }

    private sendToAll(payload: { action: "roll" | "leave" | "join", name: string, id: string, value?: number, results?: number[], subtext: string }) {
        Object.keys(this.connections).forEach(connectionId => {
            const { socket } = this.connections[connectionId];
            socket.send(JSON.stringify(payload));
        });

    }

    private processMessage(connection: Connection, event: MessageEvent) {
        // we are good to process this message
        const { action, count, size } = JSON.parse(event.data as string);
        const actionId = crypto.randomUUID();
        switch (action) {
            case "roll": {
                const results = Array(count).fill(size).map(die => Math.floor(Math.random() * die) + 1);
                const value = results.reduce((p, c) => p + c, 0);
                const subtext = `${count}d${size} => ${results.join(", ")}`;
                this.sendToAll({ action: "roll", name: connection.person.name, id: actionId, value, results, subtext });
            } break;
            case "leave": {
                this.sendToAll({ action: "leave", name: connection.person.name, id: actionId, subtext: `${connection.person.name} left` });
                this.removePerson(connection.person, connection.socket);
            } break;
        }
    }

    private removePerson(person: Person, socket: WebSocket) {
        delete this.connections[person.name];
        socket.close(1000, "WebSocket broken.");
    }
}
