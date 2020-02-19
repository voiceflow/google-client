import Client from '@voiceflow/client';
import secretsProvider, { SecretsProvider } from '@voiceflow/secrets-provider';

import { Config } from '@/types';

import { ClientMap } from '../clients';
import Google from './google';
import Voiceflow from './voiceflow';

export interface ServiceMap {
  google: Google;
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
  services.voiceflow = Voiceflow(services, config);
  services.google = new Google(services, config);

  return services;
};

export default buildServices;
