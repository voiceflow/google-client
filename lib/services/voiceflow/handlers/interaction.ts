import { HandlerFactory } from '@voiceflow/client';

import { S, T } from '@/lib/constants';

import { IntentRequest, Mapping, RequestType } from '../types';
import { addChipsIfExists, addRepromptIfExists, formatName, mapSlots } from '../utils';
import CommandHandler from './command';
import NoInputHandler from './noInput';
import NoMatchHandler from './noMatch';

type Choice = {
  intent: string;
  mappings?: Mapping[];
  nextIdIndex?: number;
};

type Interaction = {
  elseId?: string;
  noMatches?: string[];
  nextIds: string[];
  reprompt?: string;
  interactions: Choice[];
  chips?: string[];
  randomize?: boolean;
};

const utilsObj = {
  addRepromptIfExists,
  addChipsIfExists,
  formatName,
  mapSlots,
  commandHandler: CommandHandler(),
  noMatchHandler: NoMatchHandler(),
  noInputHandler: NoInputHandler(),
  v: '',
};

export const InteractionHandler: HandlerFactory<Interaction, typeof utilsObj> = (utils: typeof utilsObj) => ({
  canHandle: (block) => {
    return !!block.interactions;
  },
  handle: (block, context, variables) => {
    const request = context.turn.get(T.REQUEST) as IntentRequest;

    if (request?.type !== RequestType.INTENT) {
      // clean up reprompt on new interaction
      context.storage.delete(S.REPROMPT);

      utils.addRepromptIfExists(block, context, variables);
      utils.addChipsIfExists(block, context, variables);

      // clean up no matches counter on new interaction
      context.storage.delete(S.NO_MATCHES_COUNTER);

      // quit cycleStack without ending session by stopping on itself
      return block.blockID;
    }

    let nextId: string | null = null;
    let variableMap: Mapping[] | null = null;

    const { intent, slots } = request.payload;

    // check if there is a choice in the block that fulfills intent
    block.interactions.forEach((choice, i: number) => {
      if (choice.intent && utils.formatName(choice.intent) === intent) {
        variableMap = choice.mappings ?? null;
        nextId = block.nextIds[choice.nextIdIndex || choice.nextIdIndex === 0 ? choice.nextIdIndex : i];
      }
    });

    if (variableMap && slots) {
      // map request mappings to variables
      variables.merge(utils.mapSlots(variableMap, slots));
    }

    // check if there is a command in the stack that fulfills intent
    if (!nextId && utils.commandHandler.canHandle(context)) {
      return utils.commandHandler.handle(context, variables);
    }

    // check for no input in v2
    if (utils.v === 'v2' && utils.noInputHandler.canHandle(context)) {
      return utils.noInputHandler.handle(block, context);
    }

    // request for this turn has been processed, delete request
    context.turn.delete(T.REQUEST);

    // check for noMatches to handle
    if (!nextId && utils.noMatchHandler.canHandle(block, context)) {
      return utils.noMatchHandler.handle(block, context, variables);
    }

    // clean up no matches counter
    context.storage.delete(S.NO_MATCHES_COUNTER);

    return (nextId || block.elseId) ?? null;
  },
});

export default (v = 'v1') => InteractionHandler({ ...utilsObj, v });
