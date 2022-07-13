import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import '../styles/DiceTable.css';

export interface Message {
    id: string
    message: string
    subtext: string
}

const RollHistory: React.FC<{ log: Message[] }> = ({ log }) => {

    const lines = log.map(({ id, message, subtext }, idx) =>
        <li key={id}>
            {idx === 0 ? "> " : ""}<abbr title={subtext}>{message}</abbr>
        </li>
    );
    return (<ul>{lines}</ul>);
}

export const DiceTable: React.FC<{ name: string, table: string, socket: WebSocket | null, onLeave: () => void }> = ({ name, table, socket, onLeave }) => {

    const sizes = [4, 6, 8, 10, 12, 20, 100];

    const [count, setCount] = useState(1);
    const [sizeIndex, setSizeIndex] = useState(5);
    const [log, setLog] = useState([] as Message[]);

    const roll = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        socket?.send(JSON.stringify({ action: 'roll', count, size: sizes[sizeIndex] }));
    }

    const updateDiceCount = (event: ChangeEvent<HTMLInputElement>) => {
        setCount(parseInt(event.target.value));
    }

    const updateDiceSize = (event: ChangeEvent<HTMLInputElement>) => {
        const next = parseInt(event.target.value);
        const foundIndex = sizes.indexOf(next);
        const clamp = (x: number) => Math.max(0, Math.min(sizes.length - 1, x));
        if (foundIndex >= 0) {
            setSizeIndex(foundIndex);
        } else if (next > sizes[sizeIndex]) {
            setSizeIndex(clamp(sizeIndex + 1));
        } else if (next < sizes[sizeIndex]) {
            setSizeIndex(clamp(sizeIndex - 1));
        }
    }

    const leave = () => {
        socket?.send(JSON.stringify({ action: 'leave' }));
        onLeave();
    }

    const onMessageReceived = (message: MessageEvent<any>) => {
        const { action, name, id, value, subtext } = JSON.parse(message.data);
        const logLength = 10;
        switch (action) {
            case "join": // someone joined
                setLog((previous) => [{ id, message: `${name} joined ${table}`, subtext }, ...previous.slice(0, logLength)]);
                break;
            case "roll": // someone rolled
                setLog((previous) => [{ id, message: `${name} rolled ${value}`, subtext }, ...previous.slice(0, logLength)]);
                break;
            case "leave": // someone left
                setLog((previous) => [{ id, message: `${name} left ${table}`, subtext }, ...previous.slice(0, logLength)]);
                break;
        }
    }

    const onSocketError = (error: Event) => {
        console.error("Socket error " + error);
    }

    useEffect(() => {
        socket?.addEventListener('message', onMessageReceived);
        socket?.addEventListener('error', onSocketError);
        return function cleanup() {
            socket?.removeEventListener('message', onMessageReceived);
            socket?.removeEventListener('error', onSocketError);
        };
    }, [socket, onMessageReceived]);

    return (
        <div className="container">
            <div>Table: '{table}'</div>
            <div className="dice">
                <form onSubmit={roll}>
                    <div>
                        <input onChange={updateDiceCount} value={count} type="number" min="1" max="999" />d<input onChange={updateDiceSize} value={sizes[sizeIndex]} type="number" min="1" max="100" />
                    </div>
                    <div>
                        <button className="brutal" type="submit" autoFocus>roll</button>
                    </div>
                </form>
            </div>
            <RollHistory log={log} />
            <button className="brutal secondary" onClick={leave}>leave {table}</button><br />
        </div>
    );
}
