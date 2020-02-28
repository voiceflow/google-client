import { Handler } from '@voiceflow/client';
import wordsToNumbers from 'words-to-numbers';

import { T } from '@/lib/constants';

import { IntentRequest, RequestType } from '../types';
import { addRepromptIfExists } from '../utils';
import CommandHandler from './command';

export type Capture = {
  nextId?: string;
  variable: string | number;
  reprompt?: string;
};

const CaptureHandler: Handler<Capture> = {
  canHandle: (block) => {
    return !!block.variable;
  },
  handle: (block, context, variables) => {
    const request = context.turn.get(T.REQUEST) as IntentRequest;

    if (request?.type !== RequestType.INTENT) {
      addRepromptIfExists(block, context, variables);
      // quit cycleStack without ending session by stopping on itself
      return block.blockID;
    }

    let nextId: string | null = null;

    // check if there is a command in the stack that fulfills intent
    if (CommandHandler.canHandle(context)) {
      return CommandHandler.handle(context, variables);
    }

    const { input } = request.payload;

    if (input) {
      const num = wordsToNumbers(input);

      if (typeof num !== 'number' || Number.isNaN(num)) {
        variables.set(block.variable, input);
      } else {
        variables.set(block.variable, num);
      }
    }

    ({ nextId = null } = block);

    // request for this turn has been processed, delete request
    context.turn.delete(T.REQUEST);

    return nextId;
  },
};

export default CaptureHandler;
