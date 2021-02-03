import '@/envSetup';

import { getOptionalProcessEnv, getRequiredProcessEnv } from '@voiceflow/common';

import { Config } from '@/types';

const CONFIG: Config = {
  NODE_ENV: getRequiredProcessEnv('NODE_ENV'),
  PORT: getRequiredProcessEnv('PORT'),

  AWS_ACCESS_KEY_ID: getOptionalProcessEnv('AWS_ACCESS_KEY_ID'),
  AWS_SECRET_ACCESS_KEY: getOptionalProcessEnv('AWS_SECRET_ACCESS_KEY'),
  AWS_REGION: getOptionalProcessEnv('AWS_REGION'),
  AWS_ENDPOINT: getOptionalProcessEnv('AWS_ENDPOINT'),

  // Application secrets
  ADMIN_SERVER_DATA_API_TOKEN: getRequiredProcessEnv('ADMIN_SERVER_DATA_API_TOKEN'),
  DATADOG_API_KEY: getRequiredProcessEnv('DATADOG_API_KEY'),

  CODE_HANDLER_ENDPOINT: getOptionalProcessEnv('CODE_HANDLER_ENDPOINT'),
  INTEGRATIONS_HANDLER_ENDPOINT: getRequiredProcessEnv('INTEGRATIONS_HANDLER_ENDPOINT'),
  API_HANDLER_ENDPOINT: getOptionalProcessEnv('API_HANDLER_ENDPOINT'),
  DYNAMO_ENDPOINT: getOptionalProcessEnv('DYNAMO_ENDPOINT'),

  // Release information
  GIT_SHA: getOptionalProcessEnv('GIT_SHA'),
  BUILD_NUM: getOptionalProcessEnv('BUILD_NUM'),
  SEM_VER: getOptionalProcessEnv('SEM_VER'),
  BUILD_URL: getOptionalProcessEnv('BUILD_URL'),

  // diagrams table
  SESSIONS_DYNAMO_TABLE: getRequiredProcessEnv('SESSIONS_DYNAMO_TABLE'),

  VF_DATA_ENDPOINT: getRequiredProcessEnv('VF_DATA_ENDPOINT'),

  // Logging
  LOG_LEVEL: getOptionalProcessEnv('LOG_LEVEL'),
  MIDDLEWARE_VERBOSITY: getOptionalProcessEnv('MIDDLEWARE_VERBOSITY'),

  PROJECT_SOURCE: getOptionalProcessEnv('PROJECT_SOURCE'),

  SESSIONS_SOURCE: getOptionalProcessEnv('SESSIONS_SOURCE'),
  MONGO_URI: getOptionalProcessEnv('MONGO_URI'),
  MONGO_DB: getOptionalProcessEnv('MONGO_DB'),
};

export default CONFIG;
