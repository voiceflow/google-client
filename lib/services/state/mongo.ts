import { State } from '@voiceflow/runtime';

import { Config } from '@/types';

import { Source } from '../../constants';
import { AbstractManager } from '../types';

class StateManager extends AbstractManager {
  static GACTION_SESSIONS_DYNAMO_PREFIX = 'gactions.user';

  private collectionName = 'runtime-sessions';

  public static enabled(config: Config) {
    return config.SESSIONS_SOURCE === Source.MONGO;
  }

  async saveToDb(userId: string, state: State) {
    const { mongo } = this.services;

    const id = `${StateManager.GACTION_SESSIONS_DYNAMO_PREFIX}.${userId}`;

    const {
      result: { ok },
    } = await mongo!.db.collection(this.collectionName).updateOne({ id }, { $set: { id, attributes: state } }, { upsert: true });

    if (!ok) {
      throw Error('store runtime session error');
    }
  }

  async getFromDb(userId: string) {
    const { mongo } = this.services;

    if (!userId) {
      return {};
    }

    const id = `${StateManager.GACTION_SESSIONS_DYNAMO_PREFIX}.${userId}`;

    const session = await mongo!.db.collection(this.collectionName).findOne<{ attributes: object }>({ id }, { projection: { attributes: true } });
    return session?.attributes || {};
  }
}

export default StateManager;
