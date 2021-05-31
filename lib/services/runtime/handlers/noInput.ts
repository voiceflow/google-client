import { Node } from '@voiceflow/api-sdk';
import { Runtime } from '@voiceflow/general-runtime/build/runtime';

import { S, T } from '@/lib/constants';

import { IntentRequest } from '../types';

const NO_INPUT_PREFIX = 'actions.intent.NO_INPUT';

export const NoInputHandler = () => ({
  canHandle: (runtime: Runtime) => {
    return !!runtime.turn.get<IntentRequest>(T.REQUEST)?.payload?.intent.startsWith(NO_INPUT_PREFIX);
  },
  handle: (node: Node, runtime: Runtime) => {
    const { storage } = runtime;

    const output = storage.get<string>(S.REPROMPT) ?? storage.get<string>(S.OUTPUT);

    storage.produce<{ [S.OUTPUT]: string }>((draft) => {
      draft[S.OUTPUT] += output;
    });

    return node.id;
  },
});

export default () => NoInputHandler();
