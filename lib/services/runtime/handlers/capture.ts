import { HandlerFactory } from '@voiceflow/general-runtime/build/runtime';
import { Node } from '@voiceflow/google-types/build/nodes/capture';
import wordsToNumbers from 'words-to-numbers';

import { T } from '@/lib/constants';

import { IntentRequest, RequestType } from '../types';
import { addChipsIfExists, addRepromptIfExists } from '../utils';
import CommandHandler from './command';

const utilsObj = {
  wordsToNumbers,
  addChipsIfExists,
  addRepromptIfExists,
  commandHandler: CommandHandler(),
};

export const CaptureHandler: HandlerFactory<Node, typeof utilsObj> = (utils) => ({
  canHandle: (node) => !!node.variable,
  handle: (node, runtime, variables) => {
    const request = runtime.turn.get<IntentRequest>(T.REQUEST);

    if (request?.type !== RequestType.INTENT) {
      utils.addChipsIfExists(node, runtime, variables);
      utils.addRepromptIfExists(node, runtime, variables);

      // quit cycleStack without ending session by stopping on itself
      return node.id;
    }

    let nextId: string | null = null;

    // check if there is a command in the stack that fulfills intent
    if (utils.commandHandler.canHandle(runtime)) {
      return utils.commandHandler.handle(runtime, variables);
    }

    const { input } = request.payload;

    if (input) {
      const num = utils.wordsToNumbers(input);

      if (typeof num !== 'number' || Number.isNaN(num)) {
        variables.set(node.variable, input);
      } else {
        variables.set(node.variable, num);
      }
    }

    ({ nextId = null } = node);

    // request for this turn has been processed, delete request
    runtime.turn.delete(T.REQUEST);

    return nextId;
  },
});

export default () => CaptureHandler(utilsObj);
