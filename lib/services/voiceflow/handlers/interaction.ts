import { SlotMapping } from '@voiceflow/general-types';
import { Node } from '@voiceflow/general-types/build/nodes/interaction';
import { formatIntentName, HandlerFactory } from '@voiceflow/runtime';

import { S, T } from '@/lib/constants';

import { IntentRequest, RequestType } from '../types';
import { addChipsIfExists, addRepromptIfExists, mapSlots } from '../utils';
import CommandHandler from './command';
import NoInputHandler from './noInput';
import NoMatchHandler from './noMatch';

const utilsObj = {
  addRepromptIfExists,
  addChipsIfExists,
  formatIntentName,
  mapSlots,
  commandHandler: CommandHandler(),
  noMatchHandler: NoMatchHandler(),
  noInputHandler: NoInputHandler(),
  v: '',
};

export const InteractionHandler: HandlerFactory<Node, typeof utilsObj> = (utils: typeof utilsObj) => ({
  canHandle: (node) => !!node.interactions,
  handle: (node, context, variables) => {
    const request = context.turn.get(T.REQUEST) as IntentRequest;

    if (request?.type !== RequestType.INTENT) {
      // clean up reprompt on new interaction
      context.storage.delete(S.REPROMPT);

      utils.addRepromptIfExists(node, context, variables);

      // clean up no matches counter on new interaction
      context.storage.delete(S.NO_MATCHES_COUNTER);

      // quit cycleStack without ending session by stopping on itself
      return node.id;
    }

    let nextId: string | null = null;
    let variableMap: SlotMapping[] | null = null;

    const { intent, slots } = request.payload;

    // check if there is a choice in the node that fulfills intent
    node.interactions.forEach((choice, i: number) => {
      if (choice.intent && utils.formatIntentName(choice.intent) === intent) {
        variableMap = choice.mappings ?? null;
        nextId = node.nextIds[choice.nextIdIndex || choice.nextIdIndex === 0 ? choice.nextIdIndex : i];
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
      return utils.noInputHandler.handle(node, context);
    }

    // request for this turn has been processed, delete request
    context.turn.delete(T.REQUEST);

    // check for noMatches to handle
    if (!nextId && utils.noMatchHandler.canHandle(node, context)) {
      return utils.noMatchHandler.handle(node, context, variables);
    }

    // clean up no matches counter
    context.storage.delete(S.NO_MATCHES_COUNTER);

    return (nextId || node.elseId) ?? null;
  },
});

export default (v = 'v1') => InteractionHandler({ ...utilsObj, v });
