import { Node } from '@voiceflow/api-sdk';
import { Context } from '@voiceflow/client';

import { S, T } from '@/lib/constants';

import { IntentRequest } from '../types';

const NO_INPUT_PREFIX = 'actions.intent.NO_INPUT';

export const NoInputHandler = () => ({
  canHandle: (context: Context) => {
    return !!context.turn.get<IntentRequest>(T.REQUEST)?.payload?.intent.startsWith(NO_INPUT_PREFIX);
  },
  handle: (node: Node, context: Context) => {
    const { storage } = context;

    const output = storage.get<string>(S.REPROMPT) ?? storage.get<string>(S.OUTPUT);

    storage.produce<{ [S.OUTPUT]: string }>((draft) => {
      draft[S.OUTPUT] += output;
    });

    return node.id;
  },
});

export default () => NoInputHandler();
