import { conversation as GoogleConversation } from '@assistant/conversation';
import { GoogleProgram, GoogleVersion } from '@voiceflow/google-types';
import { DataAPI, LocalDataApi, ServerDataApi } from '@voiceflow/runtime';
import AWS from 'aws-sdk';
import { AxiosStatic } from 'axios';
import { WebhookClientConstructor } from 'dialogflow-fulfillment';
import randomstring from 'randomstring';
import uuid4 from 'uuid/v4';

import { Config } from '@/types';

import Dynamo from './dynamo';
import Metrics, { MetricsType } from './metrics';
import Static, { StaticType } from './static';

export interface ClientMap extends StaticType {
  docClient: AWS.DynamoDB.DocumentClient;
  axios: AxiosStatic;
  WebhookClient: WebhookClientConstructor;
  GoogleConversation: typeof GoogleConversation;
  uuid4: typeof uuid4;
  randomstring: typeof randomstring;
  metrics: MetricsType;
  dataAPI: DataAPI<GoogleProgram, GoogleVersion>;
}

/**
 * Build all clients
 */
const buildClients = (config: Config) => {
  const clients: ClientMap = { ...Static } as any;

  clients.dataAPI = config.PROJECT_SOURCE
    ? new LocalDataApi({ projectSource: config.PROJECT_SOURCE }, { fs: Static.fs, path: Static.path })
    : new ServerDataApi({ adminToken: config.ADMIN_SERVER_DATA_API_TOKEN, dataEndpoint: config.VF_DATA_ENDPOINT }, { axios: Static.axios });

  clients.docClient = Dynamo(config);
  clients.metrics = Metrics(config);

  return clients;
};

export const initClients = async (clients: ClientMap) => {
  await clients.dataAPI.init();
};

export default buildClients;
