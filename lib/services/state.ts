import { State } from '@voiceflow/client';

import { AbstractManager } from './types';

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

  async contextAdapter(state: Record<any, any>) {
    // eslint-disable-next-line no-console
    console.log('CONTEXT ADAPTER', state);
    // eslint-disable-next-line no-process-exit
    // process.exit(0);

    return {
      stack: [],
      storage: {
        output: state.lastOutput,
        sessions: state.sessions,
        locale: state.locale,
        user: state.user,
        repeat: state.repeat,
      },
      variables: {
        sessions: state.globals[0].sessions,
        voiceflow: {
          events: state.globals[0].voiceflow.events,
        },
        locale: state.globals[0].locale,
        user_id: state.globals[0].user_id,
        platform: state.globals[0].platform,
        timestamp: state.globals[0].timestamp,
      },
    };
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
        id: `${StateManager.GACTION_SESSIONS_DYNAMO_PREFIX}.${userId}`,
      },
    };

    const data = await docClient.get(params).promise();

    // const item = data.Item ?? {};
    let rawContext: Record<string, any>;
    if (data.Item) {
      rawContext = data.Item.state ? data.Item.state : await this.contextAdapter(data.Item.attributes);
    } else {
      rawContext = {};
    }

    // eslint-disable-next-line no-console
    console.log('rawContext', rawContext);

    return rawContext;
  }
}

export default StateManager;
