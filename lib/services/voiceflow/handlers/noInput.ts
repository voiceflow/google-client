import { Context } from '@voiceflow/client';

import { S, T } from '@/lib/constants';

type Block = {
  blockID: string;
  noMatches?: string[];
  randomize?: boolean;
};

const NO_INPUT_PREFIX = 'actions.intent.NO_INPUT';

export const NoInputHandler = () => ({
  canHandle: (context: Context) => {
    return !!context.turn.get(T.REQUEST)?.payload?.intent.startsWith(NO_INPUT_PREFIX);
  },
  handle: (block: Block, context: Context) => {
    const { storage } = context;

    const output = storage.get(S.REPROMPT) ?? storage.get(S.OUTPUT);

    storage.produce((draft) => {
      draft[S.OUTPUT] += output;
    });

    return block.blockID;
  },
});

export default () => NoInputHandler();
