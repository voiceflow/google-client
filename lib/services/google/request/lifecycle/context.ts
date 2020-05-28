import { Context, State } from '@voiceflow/client';

import { S, T, V } from '@/lib/constants';

import { AbstractManager } from '../../../types';

class ContextManager extends AbstractManager {
  async build(versionID: string, userID: string): Promise<Context> {
    const { state, voiceflow } = this.services;

    const rawState = await state.getFromDb(userID);

    const context = voiceflow.client.createContext(versionID, rawState as State);

    context.turn.set(T.PREVIOUS_OUTPUT, context.storage.get(S.OUTPUT));
    context.storage.set(S.OUTPUT, '');
    context.variables.set(V.TIMESTAMP, Math.floor(Date.now() / 1000));

    return context;
  }
}

export default ContextManager;
