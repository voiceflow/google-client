import { Handler } from '@voiceflow/client';

import { S } from '@/lib/constants';

import { Mapping } from '../types';
import { addRepromptIfExists, formatName, mapSlots } from '../utils';
// import CommandHandler from './command';

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
};

const InteractionHandler: Handler<Interaction> = {
  canHandle: (block) => {
    return !!block.interactions;
  },
  handle: (block, context, variables) => {
    const interactionReq = context.turn.get('intentRequest');

    // console.log('interaction handler');

    if (!interactionReq) {
      // console.log('not interaction req');
      addRepromptIfExists(block, context, variables);
      // TODO: add chips
      // quit cycleStack without ending session by stopping on itself
      return block.blockID;
    }

    let nextId: string | null = null;
    let variableMap: Mapping[] | null = null;

    const { intent } = interactionReq;

    // check if there is a choice in the block that fulfills intent
    block.interactions.forEach((choice, i: number) => {
      if (choice.intent && formatName(choice.intent) === intent) {
        variableMap = choice.mappings ?? null;
        nextId = block.nextIds[choice.nextIdIndex || choice.nextIdIndex === 0 ? choice.nextIdIndex : i];
      }
    });

    if (variableMap && interactionReq.slots) {
      // map request mappings to variables
      variables.merge(mapSlots(variableMap, interactionReq.slots));
    }

    // console.log('did we made it here?');

    // TODO: check if there is a command in the stack that fulfills intent
    // if (!nextId && CommandHandler.canHandle(context)) {
    //   return CommandHandler.handle(context, variables);
    // }

    // request for this turn has been processed, delete request
    context.turn.delete('interaction');

    // TODO: why does the output have the last spoken? temp solution
    context.storage.set(S.OUTPUT, '');

    // console.log('THE NEXT ID', (nextId || block.elseId) ?? null);
    return (nextId || block.elseId) ?? null;
  },
};

export default InteractionHandler;
