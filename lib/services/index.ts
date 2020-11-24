import { Config } from '@/types';

import { ClientMap } from '../clients';
import Adapter from './adapter';
import Google from './google';
import GoogleV2 from './googleV2';
import { DynamoState, MongoState, State } from './state';
import Voiceflow from './voiceflow';

export interface ServiceMap {
  adapter: Adapter;
  state: State;
  google: Google;
  googleV2: GoogleV2;
  voiceflow: ReturnType<typeof Voiceflow>;
  voiceflowV2: ReturnType<typeof Voiceflow>;
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
  services.state = MongoState.enabled(config) ? new MongoState(services, config) : new DynamoState(services, config);
  services.voiceflow = Voiceflow(services, config);
  services.voiceflowV2 = Voiceflow(services, config, 'v2');
  services.google = new Google(services, config);
  services.googleV2 = new GoogleV2(services, config);

  return services;
};

export default buildServices;
