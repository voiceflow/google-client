import { Handler } from '@voiceflow/client';

import { T } from '@/lib/constants';

import { IntentRequest, RequestType } from '../../types';
import { addRepromptIfExists } from '../../utils';
import CommandHandler from '../command';
import getBestScore from './score';

type Choice = {
  elseId?: string;
  nextIds: string[];
  reprompt?: string;
  choices: any[];
  inputs: Array<string[]>;
};

const ChoiceHandler: Handler<Choice> = {
  canHandle: (block) => {
    return !!block.choices;
  },
  handle: (block, context, variables) => {
    const request = context.turn.get(T.REQUEST) as IntentRequest;

    if (request?.type !== RequestType.INTENT) {
      addRepromptIfExists(block, context, variables);
      // quit cycleStack without ending session by stopping on itself
      return block.blockID;
    }

    let nextId: string | null = null;

    const { input } = request.payload;

    let result = null;
    const choices: Array<{ string: string; value: number }> = [];
    if (Array.isArray(block.inputs)) {
      block.inputs
        .filter((_input) => Array.isArray(_input))
        .forEach((_input, i) => {
          _input.forEach((choice) => {
            if (choice) {
              choices.push({
                string: choice,
                value: i,
              });
            }
          });
        });
    }
    result = getBestScore(input, choices);

    if (result in block.nextIds) {
      nextId = block.nextIds[result];
    }

    // check if there is a command in the stack that fulfills intent
    if (!nextId && CommandHandler.canHandle(context)) {
      return CommandHandler.handle(context, variables);
    }

    // request for this turn has been processed, delete request
    context.turn.delete(T.REQUEST);

    return (nextId || block.elseId) ?? null;
  },
};

export default ChoiceHandler;
