import { SlotMapping } from '@voiceflow/api-sdk';
import { Node } from '@voiceflow/google-types/build/nodes/interaction';
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
  handle: (node, runtime, variables) => {
    const request = runtime.turn.get(T.REQUEST) as IntentRequest;

    if (request?.type !== RequestType.INTENT) {
      // clean up reprompt on new interaction
      runtime.storage.delete(S.REPROMPT);

      utils.addRepromptIfExists(node, runtime, variables);
      utils.addChipsIfExists(node, runtime, variables);

      // clean up no matches counter on new interaction
      runtime.storage.delete(S.NO_MATCHES_COUNTER);

      // quit cycleStack without ending session by stopping on itself
      return node.id;
    }

    let nextId: string | null | undefined;
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
    if (nextId === undefined && utils.commandHandler.canHandle(runtime)) {
      return utils.commandHandler.handle(runtime, variables);
    }

    // check for no input in v2
    if (utils.v === 'v2' && utils.noInputHandler.canHandle(runtime)) {
      return utils.noInputHandler.handle(node, runtime);
    }

    // request for this turn has been processed, delete request
    runtime.turn.delete(T.REQUEST);

    // check for noMatches to handle
    if (nextId === undefined && utils.noMatchHandler.canHandle(node, runtime)) {
      return utils.noMatchHandler.handle(node, runtime, variables);
    }

    // clean up no matches counter
    runtime.storage.delete(S.NO_MATCHES_COUNTER);

    return (nextId !== undefined ? nextId : node.elseId) || null;
  },
});

export default (v = 'v1') => InteractionHandler({ ...utilsObj, v });
