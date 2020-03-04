import { Context, State } from '@voiceflow/client';

import { S, T } from '@/lib/constants';

import { FullServiceMap } from '..';

const build = async (services: FullServiceMap, versionID: string, userID: string): Promise<Context> => {
  const { state, voiceflow } = services;

  const rawState = await state.getFromDb(userID);

  const context = voiceflow.createContext(versionID, rawState as State);

  context.turn.set(T.PREVIOUS_OUTPUT, context.storage.get(S.OUTPUT));
  context.storage.set(S.OUTPUT, '');

  return context;
};

export default build;
