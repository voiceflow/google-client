import { State } from '@voiceflow/client';

import { AbstractManager } from './utils';

const GACTION_SESSIONS_DYNAMO_PREFIX = 'gactions.user';

class StateManager extends AbstractManager {
  async saveToDb(userId: string, state: State) {
    const { docClient } = this.services;
    const { SESSIONS_DYNAMO_TABLE } = this.config;

    const params = {
      TableName: SESSIONS_DYNAMO_TABLE,
      Item: {
        id: `${GACTION_SESSIONS_DYNAMO_PREFIX}.${userId}`,
        state,
      },
    };

    try {
      await docClient.put(params).promise();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('persist state error:', e);
    }
  }

  async getFromDb(userId: string) {
    const { docClient } = this.services;
    const { SESSIONS_DYNAMO_TABLE } = this.config;

    if (!userId) {
      return {};
    }

    const params = {
      TableName: SESSIONS_DYNAMO_TABLE,
      Key: {
        id: `${GACTION_SESSIONS_DYNAMO_PREFIX}.${userId}`,
      },
    };

    try {
      const data = await docClient.get(params).promise();

      if (!data.Item) {
        throw new Error(`session not found for userId: ${userId}`);
      }

      return data.Item.state;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('get state from db err:', err);
      return {};
    }
  }
}

export default StateManager;
