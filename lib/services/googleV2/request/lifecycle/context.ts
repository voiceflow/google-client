import { Context, State } from '@voiceflow/client';

import { S, T } from '@/lib/constants';

import { AbstractManager } from '../../../types';

class ContextManager extends AbstractManager {
  async build(versionID: string, userID: string): Promise<Context> {
    const { state, voiceflowV2 } = this.services;

    const rawState = await state.getFromDb(userID);

    const context = voiceflowV2.client.createContext(versionID, rawState as State);

    context.turn.set(T.PREVIOUS_OUTPUT, context.storage.get(S.OUTPUT));
    context.storage.set(S.OUTPUT, '');

    return context;
  }
}

export default ContextManager;
