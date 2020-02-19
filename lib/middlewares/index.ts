import { routeWrapper } from '@/lib/utils';
import { Config, MiddlewareGroup } from '@/types';

import { FullServiceMap } from '../services';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MiddlewareMap {}

export interface MiddlewareClass<T = MiddlewareGroup> {
  new (services: FullServiceMap, config: Config): T;
}

/**
 * Build all middlewares
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const buildMiddleware = (_services: FullServiceMap, _config: Config) => {
  const middlewares = {} as MiddlewareMap;

  // everything before this will be route-wrapped
  routeWrapper(middlewares);

  return middlewares;
};

export default buildMiddleware;
