import { corsHeaders } from "@/middleware";

const errorResponse = (env: Bindings, error: string) => {
    new Response(JSON.stringify({ error }), {
        headers: {
            "Content-Type": "application/json",
            ...corsHeaders(env)
        }
    })
}

const join = async (request: Request, env: Bindings, ctx: ExecutionContext) => {
    const { name, table } = await request.json();

    // Make name take a seat at the table
    const errors = [];
    if (name.length < 2 || name.length > 30) {
        return errorResponse(env, "Name should be between 2 and 30 characters");
    }
    if (table.length !== 4) {
        return errorResponse(env, "Invalid code for table");
    }

    // Find the table that user wants to join
    let id = env.TABLE.idFromName(table);
    let obj = env.TABLE.get(id);

    // Generate a token that name can use to connect to the tables websocket
    try {
        const response = await obj.fetch(`https://table?action=join&name=${name}`);
        const text = await response.text();
        if (response.status === 201) {
            return new Response(JSON.stringify({ token: text }), {
                headers: {
                    "Content-Type": "application/json",
                    ...corsHeaders(env)
                }
            });
        } else {
            return new Response(text, {
                status: response.status,
                statusText: response.statusText,
                headers: {
                    "Content-Type": "text/plain",
                    ...corsHeaders(env)
                }
            });
        }

    } catch (_) {
        return errorResponse(env, "Unable to join table");
    }
}

const connect = async (request: Request, env: Bindings, ctx: ExecutionContext) => {
    const params = new URLSearchParams(new URL(request.url).search);
    const token = params.get("token") || "";
    const table = params.get("table") || "";
    if (table.length !== 4) return errorResponse(env, "No table specified");
    if (token.length == 0) return errorResponse(env, "Invalid token");

    const id = env.TABLE.idFromName(table);
    let obj = env.TABLE.get(id);

    return obj.fetch(`https://table?action=connect&token=${token}`, {
        headers: {
            "Upgrade": "websocket"
        }
    });
}

export default { join, connect };
