import { State } from '@voiceflow/runtime';

import { AbstractManager } from '../types';

class StateManager extends AbstractManager {
  public table: Record<string, any> = {};

  async saveToDb(userId: string, state: State) {
    this.table[userId] = state;
  }

  async getFromDb(userId: string) {
    return this.table[userId] || {};
  }
}

export default StateManager;
