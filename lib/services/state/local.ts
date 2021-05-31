import { State } from '@voiceflow/general-runtime/build/runtime';

import { AbstractManager } from '../types';

class StateManager extends AbstractManager {
  public table: Record<string, any> = {};

  async saveToDb(userId: string, state: State) {
    this.table[userId] = state;
  }

  async getFromDb<T extends Record<string, any> = Record<string, any>>(userId: string) {
    return (this.table[userId] || {}) as T;
  }
}

export default StateManager;
