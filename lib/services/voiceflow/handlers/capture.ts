import { HandlerFactory } from '@voiceflow/client';
import wordsToNumbers from 'words-to-numbers';

import { T } from '@/lib/constants';

import { IntentRequest, RequestType } from '../types';
import { addChipsIfExists, addRepromptIfExists } from '../utils';
import CommandHandler from './command';

export type Capture = {
  nextId?: string;
  variable: string | number;
  reprompt?: string;
  chips?: string[];
};

const utilsObj = {
  wordsToNumbers,
  addChipsIfExists,
  addRepromptIfExists,
  commandHandler: CommandHandler(),
};

export const CaptureHandler: HandlerFactory<Capture, typeof utilsObj> = (utils) => ({
  canHandle: (block) => {
    return !!block.variable;
  },
  handle: (block, context, variables) => {
    const request = context.turn.get(T.REQUEST) as IntentRequest;

    if (request?.type !== RequestType.INTENT) {
      utils.addRepromptIfExists(block, context, variables);
      utils.addChipsIfExists(block, context, variables);
      // quit cycleStack without ending session by stopping on itself
      return block.blockID;
    }

    let nextId: string | null = null;

    // check if there is a command in the stack that fulfills intent
    if (utils.commandHandler.canHandle(context)) {
      return utils.commandHandler.handle(context, variables);
    }

    const { input } = request.payload;

    if (input) {
      const num = utils.wordsToNumbers(input);

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
});

export default () => CaptureHandler(utilsObj);
