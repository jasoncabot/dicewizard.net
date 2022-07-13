import { Request } from 'itty-router'

export interface User {
    id: string
}

export interface RequestWithUser extends Request {
    user: User | undefined
    headers: Headers
}

export const withUser = (request: RequestWithUser) => {
    const token = request.headers.get("Authorization")?.slice(7); // strip off Bearer
    if (!!token) {
        request.user = { id: token };
    }
}

export const requireUser = (request: RequestWithUser) => {
    if (!request.user) {
        return new Response('Not Authenticated', { status: 401 })
    }
}
