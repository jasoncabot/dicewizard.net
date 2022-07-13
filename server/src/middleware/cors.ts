export const corsHeaders: (env: Bindings) => Record<string, string> = (env: Bindings) => {
    return {
        'Access-Control-Allow-Origin': env.FRONTEND_URI,
        'Access-Control-Allow-Headers': 'Authorization, Upgrade-Insecure-Requests'
    }
}

export const allowCrossOriginRequests = (_: Request, env: Bindings) => new Response(null, {
    status: 204,
    headers: corsHeaders(env)
});
