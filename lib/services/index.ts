import Client from '@voiceflow/client';
import secretsProvider, { SecretsProvider } from '@voiceflow/secrets-provider';

import { Config } from '@/types';

import { ClientMap } from '../clients';
import Google from './google';
import State from './state';
import Voiceflow from './voiceflow';

export interface ServiceMap {
  state: State;
  google: ReturnType<typeof Google>;
  voiceflow: Client;
}

export interface FullServiceMap extends ClientMap, ServiceMap {
  secretsProvider: SecretsProvider;
}

/**
 * Build all services
 */
const buildServices = (config: Config, clients: ClientMap): FullServiceMap => {
  const services = {
    ...clients,
  } as FullServiceMap;

  services.secretsProvider = secretsProvider;
  services.state = new State(services, config);
  services.voiceflow = Voiceflow(services, config);
  services.google = Google(services, config);

  return services;
};

export default buildServices;
