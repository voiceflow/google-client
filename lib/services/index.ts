import Client from '@voiceflow/client';
import secretsProvider, { SecretsProvider } from '@voiceflow/secrets-provider';

import { Config } from '@/types';

import { ClientMap } from '../clients';
import Context from './context';
import Google from './google';
import Handler from './handler';
import Lifecycle from './lifecycle';
import Response from './response';
import State from './state';
import Voiceflow from './voiceflow';

export interface ServiceMap {
  state: State;
  lifecycle: Lifecycle;
  context: Context;
  response: Response;
  handler: Handler;
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
  services.state = new State(services, config);
  services.lifecycle = new Lifecycle(services, config);
  services.context = new Context(services, config);
  services.response = new Response(services, config);
  services.handler = new Handler(services, config);
  services.voiceflow = Voiceflow(services, config);
  services.google = new Google(services, config);

  return services;
};

export default buildServices;
