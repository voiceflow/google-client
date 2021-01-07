import AWS from 'aws-sdk';

import { Config } from '@/types';

const DocClient = (config: Config) => {
  return config.DYNAMO_ENDPOINT
    ? new AWS.DynamoDB.DocumentClient({
        convertEmptyValues: false,
        endpoint: config.DYNAMO_ENDPOINT,
      })
    : new AWS.DynamoDB.DocumentClient({
        convertEmptyValues: false,
      });
};

export default DocClient;
