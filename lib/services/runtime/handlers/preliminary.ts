import { Node } from '@voiceflow/api-sdk';
import { HandlerFactory } from '@voiceflow/general-runtime/build/runtime';

import { T } from '@/lib/constants';

import { RequestType } from '../types';
import CaptureHandler from './capture';
import CommandHandler from './command';
import InteractionHandler from './interaction';

export const eventHandlers = [CaptureHandler(), InteractionHandler()];

const utilsObj = {
  commandHandler: CommandHandler(),
  eventHandlers,
};

/**
 * If request comes in but runtime nodeID is not a node that handles events (i.e, interaction, capture, etc..) =>
 * Handle it here
 */
export const PreliminaryHandler: HandlerFactory<Node<any, any>, typeof utilsObj> = (utils) => ({
  canHandle: (node, runtime, variables, program) => {
    const request = runtime.turn.get<{ type: string } | null>(T.REQUEST);
    return !!request && request.type !== RequestType.MEDIA_STATUS && !utils.eventHandlers.find((h) => h.canHandle(node, runtime, variables, program));
  },
  handle: (node, runtime, variables) => {
    // check if there is a command in the stack that fulfills request
    if (utils.commandHandler.canHandle(runtime)) {
      return utils.commandHandler.handle(runtime, variables);
    }

    // request for this turn has been processed, delete request
    runtime.turn.delete(T.REQUEST);

    // return current id
    return node.id;
  },
});

export default () => PreliminaryHandler(utilsObj);
