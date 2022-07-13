import { corsHeaders } from "./cors";

export const notFound = (env: Bindings, message: string) => (_: Request) => new Response(message, { status: 404, headers: { ...corsHeaders(env) } });
