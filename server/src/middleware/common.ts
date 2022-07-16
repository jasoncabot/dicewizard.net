import { corsHeaders } from "./cors";

export const notFoundResponse = (env: Bindings, message: string) => {
    return new Response(message, {
        status: 404,
        headers: { "Content-Type": "text/plain", ...corsHeaders(env) }
    });
}

export const errorResponse = (env: Bindings, error: string) => {
    return new Response(error, {
        status: 400,
        headers: { "Content-Type": "text/plain", ...corsHeaders(env) }
    });
}

