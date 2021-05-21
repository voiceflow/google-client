import { Config } from '@/types';

import { ClientMap } from '../clients';
import { Source } from '../constants';
import Adapter from './adapter';
import Dialogflow from './dialogflow';
import Google from './google';
import GoogleV2 from './googleV2';
import Runtime from './runtime';
import { DynamoState, LocalState, MongoState, State } from './state';

export interface ServiceMap {
  adapter: Adapter;
  state: State;
  google: Google;
  googleV2: GoogleV2;
  dialogflow: Dialogflow;
  runtimeClient: ReturnType<typeof Runtime>;
  runtimeClientV2: ReturnType<typeof Runtime>;
}

export interface FullServiceMap extends ClientMap, ServiceMap {}

/**
 * Build all services
 */
const buildServices = (config: Config, clients: ClientMap): FullServiceMap => {
  const services = {
    ...clients,
  } as FullServiceMap;

  services.adapter = new Adapter(services, config);

  if (config.SESSIONS_SOURCE === Source.LOCAL) {
    services.state = new LocalState(services, config);
  } else if (MongoState.enabled(config)) {
    services.state = new MongoState(services, config);
  } else {
    services.state = new DynamoState(services, config);
  }

  services.runtimeClient = Runtime(services, config);
  services.runtimeClientV2 = Runtime(services, config, 'v2');

  services.google = new Google(services, config);
  services.googleV2 = new GoogleV2(services, config);
  services.dialogflow = new Dialogflow(services, config);

  return services;
};

export default buildServices;
