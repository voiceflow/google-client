import { Config } from '@/types';

import { FullServiceMap } from '.';

// eslint-disable-next-line import/prefer-default-export
export abstract class AbstractManager<T = {}> {
  public services: FullServiceMap & T;

  constructor(services: FullServiceMap, public config: Config) {
    this.services = services as FullServiceMap & T;
  }
}

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
