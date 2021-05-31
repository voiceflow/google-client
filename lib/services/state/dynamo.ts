import { State } from '@voiceflow/general-runtime/build/runtime';

import { AbstractManager } from '../types';

class StateManager extends AbstractManager {
  static GACTION_SESSIONS_DYNAMO_PREFIX = 'gactions.user';

  async saveToDb(userId: string, state: State) {
    const { docClient } = this.services;
    const { SESSIONS_DYNAMO_TABLE } = this.config;

    const params = {
      TableName: SESSIONS_DYNAMO_TABLE,
      Item: {
        id: `${StateManager.GACTION_SESSIONS_DYNAMO_PREFIX}.${userId}`,
        state,
      },
    };

    await docClient.put(params).promise();
  }

  async getFromDb<T extends Record<string, any> = Record<string, any>>(userId: string) {
    const { docClient, adapter } = this.services;
    const { SESSIONS_DYNAMO_TABLE } = this.config;

    if (!userId) {
      return {} as T;
    }

    const params = {
      TableName: SESSIONS_DYNAMO_TABLE,
      Key: {
        id: `${StateManager.GACTION_SESSIONS_DYNAMO_PREFIX}.${userId}`,
      },
    };

    const data = await docClient.get(params).promise();

    return (data.Item?.state ?? (data.Item?.attributes ? adapter.state(data.Item.attributes) : {})) as T;
  }
}

export default StateManager;
