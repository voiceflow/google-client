import { Context, DataAPI, State } from '@voiceflow/client';
import { GoogleProgram, GoogleVersion } from '@voiceflow/google-types';

import { S, T } from '@/lib/constants';

import { AbstractManager } from '../../../types';

class ContextManager extends AbstractManager {
  async build(versionID: string, userID: string): Promise<Context<DataAPI<GoogleProgram, GoogleVersion>>> {
    const { state, voiceflow } = this.services;

    const rawState = await state.getFromDb(userID);

    const context = voiceflow.client.createContext(versionID, rawState as State) as Context<DataAPI<GoogleProgram, GoogleVersion>>;

    context.turn.set(T.PREVIOUS_OUTPUT, context.storage.get(S.OUTPUT));
    context.storage.set(S.OUTPUT, '');

    return context;
  }
}

export default ContextManager;
