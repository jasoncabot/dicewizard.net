import { Router } from 'itty-router';

import { SeatHandler } from './handlers';
import { allowCrossOriginRequests, notFound } from './middleware';

const router = Router({ base: '/api' })
  .post('/seats', SeatHandler.join)
  .get('/connection', SeatHandler.connect)
  .options('*', allowCrossOriginRequests)
  ;

const baseRouter = Router()
  .all('/api/*', router.handle)
  .all('*', (_: Request, env: Bindings) => notFound(env, 'Route not registered'))
  ;

const worker: ExportedHandler<Bindings> = {
  fetch: async (request: Request, env: Bindings, context: ExecutionContext) => {
    return baseRouter.handle(request, env, context);
  }
};

export * from "./durable-objects";

export default worker;
