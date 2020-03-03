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

    await docClient.put(params).promise();
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

    const data = await docClient.get(params).promise();

    return data.Item?.state ?? {};
  }
}

export default StateManager;
