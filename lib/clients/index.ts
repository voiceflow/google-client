import { conversation as GoogleConversation } from '@assistant/conversation';
import { GoogleProgram, GoogleVersion } from '@voiceflow/google-types';
import { DataAPI, LocalDataApi, ServerDataApi } from '@voiceflow/runtime';
import AWS from 'aws-sdk';
import { AxiosStatic } from 'axios';
import { WebhookClientConstructor } from 'dialogflow-fulfillment';
import randomstring from 'randomstring';
import uuid4 from 'uuid/v4';

import { MongoState } from '@/lib/services/state';
import { Config } from '@/types';

import Dynamo from './dynamo';
import Metrics, { MetricsType } from './metrics';
import MongoDB from './mongodb';
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
  mongo: MongoDB | null;
}

/**
 * Build all clients
 */
const buildClients = (config: Config) => {
  const clients: ClientMap = { ...Static } as any;

  clients.dataAPI = config.PROJECT_SOURCE
    ? new LocalDataApi({ projectSource: config.PROJECT_SOURCE }, { fs: Static.fs, path: Static.path })
    : new ServerDataApi({ adminToken: config.ADMIN_SERVER_DATA_API_TOKEN, dataEndpoint: config.VF_DATA_ENDPOINT }, { axios: Static.axios });
  clients.mongo = MongoState.enabled(config) ? new MongoDB(config) : null;

  clients.docClient = Dynamo(config);
  clients.metrics = Metrics(config);

  return clients;
};

export const initClients = async (config: Config, clients: ClientMap) => {
  await clients.dataAPI.init();
  if (MongoState.enabled(config)) await clients.mongo!.start();
};

export const stopClients = async (config: Config, clients: ClientMap) => {
  if (MongoState.enabled(config)) await clients.mongo!.stop();
};

export default buildClients;
