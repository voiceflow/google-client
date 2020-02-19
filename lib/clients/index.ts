import AWS from 'aws-sdk';
import { AxiosStatic } from 'axios';
import { WebhookClientConstructor } from 'dialogflow-fulfillment';

import { Config } from '@/types';

import Dynamo from './dynamo';
import Static from './static';

export interface ClientMap {
  dynamo: AWS.DynamoDB;
  axios: AxiosStatic;
  WebhookClient: WebhookClientConstructor;
}

/**
 * Build all clients
 */
const buildClients = (config: Config) => {
  const clients = { ...Static } as ClientMap;

  clients.dynamo = Dynamo(config);

  return clients;
};

export default buildClients;
