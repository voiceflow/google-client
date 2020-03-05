import { Config } from '@/types';

import { FullServiceMap } from '.';

export { Config, FullServiceMap };
// eslint-disable-next-line import/prefer-default-export
export abstract class AbstractManager<T = {}> {
  public services: FullServiceMap & T;

  constructor(services: FullServiceMap, public config: Config) {
    this.services = services as FullServiceMap & T;
  }
}

type InjectedServiceMap<S extends object> = { [K in keyof S]: { new (services: FullServiceMap, config: Config): S[K] } };

export const autoinject = <S extends object>(injectedServiceMap: InjectedServiceMap<S>) => <T extends { new (...args: any[]): any }>(clazz: T): any =>
  class extends clazz {
    constructor(...args: any[]) {
      super(...args);
      const keys = Object.keys(injectedServiceMap) as (keyof typeof injectedServiceMap)[];
      const injectedServices = keys
        .filter((key) => !(key in this.services))
        .reduce((acc, key) => {
          const Service = injectedServiceMap[key];
          acc[key] = new Service(this.services, this.config);
          return acc;
        }, {} as S);
      this.services = { ...this.services, ...injectedServices };
    }
  };
