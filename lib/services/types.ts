import { isConstructor } from '@/lib/utils';
import { Config } from '@/types';

import { FullServiceMap } from '.';

// eslint-disable-next-line import/prefer-default-export
export abstract class AbstractManager<T = {}> {
  public services: FullServiceMap & T;

  constructor(services: FullServiceMap, public config: Config) {
    this.services = services as FullServiceMap & T;
  }
}

type InjectedServiceMap<S extends object> = { [K in keyof S]: { new (services: FullServiceMap, config: Config): S[K] } };

const constructService = (Service: any, services: any, config: any) => {
  // eslint-disable-next-line no-nested-ternary
  return isConstructor(Service) ? new Service(services, config) : typeof Service === 'function' ? Service(services, config) : Service;
};

export const injectServices = <S extends object>(injectedServiceMap: InjectedServiceMap<S> | S) => <T extends { new (...args: any[]): any }>(
  clazz: T
): any =>
  class extends clazz {
    constructor(...args: any[]) {
      super(...args);
      const keys = Object.keys(injectedServiceMap) as (keyof typeof injectedServiceMap)[];
      const injectedServices = keys
        .filter((key) => !(key in this.services))
        .reduce((acc, key) => {
          const Service = injectedServiceMap[key];
          acc[key] = constructService(Service, this.services, this.config);
          return acc;
        }, {} as S);
      this.services = { ...this.services, ...injectedServices };
    }
  };

export interface Slot {
  name: string;
  type: {
    value: string;
  };
}

export interface SkillMetadata {
  creator_id: number;
  restart: boolean;
  resume_prompt: any;
  error_prompt: any;
  diagram: string;
  global: string[];
  repeat: number;
  slots: Slot[];
  fulfillment: Record<string, any>;
}
export interface Audio {
  url: string;
  title?: string;
  description?: string;
  icon?: string;
  background?: string;
  offset: number;
}
