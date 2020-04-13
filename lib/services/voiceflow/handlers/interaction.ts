import { HandlerFactory } from '@voiceflow/client';

import { T } from '@/lib/constants';

import { IntentRequest, Mapping, RequestType } from '../types';
import { addChipsIfExists, addRepromptIfExists, formatName, mapSlots } from '../utils';
import CommandHandler from './command';

type Choice = {
  intent: string;
  mappings?: Mapping[];
  nextIdIndex?: number;
};

type Interaction = {
  elseId?: string;
  nextIds: string[];
  reprompt?: string;
  interactions: Choice[];
  chips?: string[];
};

const utilsObj = {
  addRepromptIfExists,
  addChipsIfExists,
  formatName,
  mapSlots,
  commandHandler: CommandHandler(),
};

export const InteractionHandler: HandlerFactory<Interaction, typeof utilsObj> = (utils: typeof utilsObj) => ({
  canHandle: (block) => {
    return !!block.interactions;
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

    // request for this turn has been processed, delete request
    context.turn.delete(T.REQUEST);

    return (nextId || block.elseId) ?? null;
  },
});

export default () => InteractionHandler(utilsObj);
