import { Config } from '@/types';

import { FullServiceMap } from '.';

export { Config, FullServiceMap };
// eslint-disable-next-line import/prefer-default-export
export abstract class AbstractManager<T = {}> {
  constructor(public services: FullServiceMap & T, public config: Config) {}
}

export type ManagerFunction<T = {}> = (services: FullServiceMap & T, config: Config) => AbstractManager;
