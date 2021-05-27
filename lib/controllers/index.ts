import { routeWrapper } from '@/lib/utils';
import { Config, Controller } from '@/types';

import { FullServiceMap } from '../services';
import Dialogflow from './dialogflow';
import Google from './google';

export interface ControllerMap {
  google: Google;
  dialogflow: Dialogflow;
}

export interface ControllerClass<T = Controller> {
  new (services: FullServiceMap, config: Config): T;
}

/**
 * Build all controllers
 */
const buildControllers = (services: FullServiceMap, config: Config) => {
  const controllers = {} as ControllerMap;

  controllers.dialogflow = new Dialogflow(services, config);

  // everything before this will be route-wrapped
  routeWrapper(controllers);

  controllers.google = new Google(services, config);

  return controllers;
};

export default buildControllers;
