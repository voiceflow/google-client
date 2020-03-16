/* eslint-disable sonarjs/no-duplicate-string */

import Common from '@voiceflow/common';
import AWS from 'aws-sdk';
import { expect } from 'chai';
import sinon from 'sinon';

import StateManager from '@/lib/services/state';

const { getProcessEnv } = Common.utils.general;

AWS.config = new AWS.Config({
  accessKeyId: getProcessEnv('AWS_ACCESS_KEY_ID'),
  secretAccessKey: getProcessEnv('AWS_SECRET_ACCESS_KEY'),
  endpoint: getProcessEnv('AWS_ENDPOINT'),
  region: getProcessEnv('AWS_REGION'),
} as any);

const TABLE = 'testTable';

const setUpBasicStateManager = (docClient: AWS.DynamoDB.DocumentClient) => {
  const services = {
    docClient,
  };
  const config = {
    SESSIONS_DYNAMO_TABLE: TABLE,
  };
  return new StateManager(services as any, config as any);
};

describe('stateManager integration tests', () => {
  let client: AWS.DynamoDB;
  let docClient: AWS.DynamoDB.DocumentClient;

  before(async () => {
    client = new AWS.DynamoDB();

    docClient = new AWS.DynamoDB.DocumentClient({
      convertEmptyValues: true,
      endpoint: getProcessEnv('DYNAMO_ENDPOINT'),
    });
  });

  beforeEach(async () => {
    sinon.restore();
    const params = {
      AttributeDefinitions: [
        {
          AttributeName: 'id',
          AttributeType: 'S',
        },
      ],
      KeySchema: [
        {
          AttributeName: 'id',
          KeyType: 'HASH',
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    };
    const liveParams = { ...params, TableName: TABLE };
    await client.createTable(liveParams).promise();
  });

  afterEach(async () => {
    await client.deleteTable({ TableName: TABLE }).promise();
  });

  describe('saveToDb', () => {
    it('works correctly', async () => {
      const id = '1';
      const state = {
        foo: 'bar',
      };

      const stateManager = setUpBasicStateManager(docClient);

      await stateManager.saveToDb(id, state as any);

      const data = await docClient
        .get({
          TableName: TABLE,
          Key: {
            id: `${StateManager.GACTION_SESSIONS_DYNAMO_PREFIX}.${id}`,
          },
        })
        .promise();

      expect(data.Item).to.eql({ id: `${StateManager.GACTION_SESSIONS_DYNAMO_PREFIX}.${id}`, state });
    });
  });

  describe('getFromDb', () => {
    it('works correctly', async () => {
      const id = '1';

      const item = {
        state: { foo: 'bar' },
        id: `${StateManager.GACTION_SESSIONS_DYNAMO_PREFIX}.${id}`,
      };

      await docClient
        .put({
          Item: item,
          TableName: TABLE,
        })
        .promise();

      const stateManager = setUpBasicStateManager(docClient);

      expect(await stateManager.getFromDb(id)).to.eql(item.state);
    });
  });
});
