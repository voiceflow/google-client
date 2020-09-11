import AWS from 'aws-sdk';
import { AxiosStatic } from 'axios';
import randomstring from 'randomstring';
import uuid4 from 'uuid/v4';

import { Config } from '@/types';

import Dynamo from './dynamo';
import Metrics, { MetricsType } from './metrics';
import Static from './static';

export interface ClientMap {
  docClient: AWS.DynamoDB.DocumentClient;
  axios: AxiosStatic;
  uuid4: typeof uuid4;
  randomstring: typeof randomstring;
  metrics: MetricsType;
}

/**
 * Build all clients
 */
const buildClients = (config: Config) => {
  const clients = { ...Static } as ClientMap;

  clients.docClient = Dynamo(config);
  clients.metrics = Metrics(config);

  return clients;
};

export default buildClients;
