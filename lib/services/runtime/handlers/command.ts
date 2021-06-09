import { CommandMapping } from '@voiceflow/api-sdk';
import { extractFrameCommand, Frame, Runtime, Store } from '@voiceflow/general-runtime/build/runtime';
import { Command as IntentCommand } from '@voiceflow/google-types/build/nodes/command';

import { F, S, T } from '@/lib/constants';

import { IntentName, IntentRequest, RequestType } from '../types';
import { mapSlots } from '../utils';

export const getCommand = (runtime: Runtime, extractFrame: typeof extractFrameCommand) => {
  const request = runtime.turn.get<IntentRequest>(T.REQUEST);

  if (request?.type !== RequestType.INTENT) {
    return null;
  }

  const { intent, slots } = request.payload;

  // don't act on a catchall intent
  if (intent === IntentName.VOICEFLOW) return null;

  const matcher = (command: IntentCommand | null) => command?.intent === intent;

  const res = extractFrame<IntentCommand>(runtime.stack, matcher);

  if (!res) {
    return null;
  }

  return {
    ...res,
    intent,
    slots,
  };
};

const utilsObj = {
  Frame,
  mapSlots,
  getCommand: (runtime: Runtime) => getCommand(runtime, extractFrameCommand),
};

/**
 * The Command Handler is meant to be used inside other handlers, and should never handle blocks directly
 */
export const CommandHandler = (utils: typeof utilsObj) => ({
  canHandle: (runtime: Runtime): boolean => !!utils.getCommand(runtime),
  handle: (runtime: Runtime, variables: Store): string | null => {
    const res = utils.getCommand(runtime);
    if (!res) return null;

    let nextId: string | null = null;
    let variableMap: CommandMapping[] | undefined;

    if (res.command) {
      const { index, command } = res;

      variableMap = command.mappings.map(({ slot, variable }) => ({ slot: slot ?? '', variable: variable ?? '' }));

      if (command.diagram_id) {
        runtime.stack.top().storage.set(F.CALLED_COMMAND, true);

        // Reset state to beginning of new diagram and store current line to the stack
        const newFrame = new utils.Frame({ programID: command.diagram_id });
        runtime.stack.push(newFrame);
      } else if (command.next) {
        if (index < runtime.stack.getSize() - 1) {
          // otherwise destructive and pop off everything before the command
          runtime.stack.popTo(index + 1);
          runtime.stack.top().setNodeID(command.next);
        } else if (index === runtime.stack.getSize() - 1) {
          // jumping to an intent within the same flow
          nextId = command.next;
          // clear previous output
          runtime.storage.set(S.OUTPUT, '');
        }
      }
    }

    runtime.turn.delete(T.REQUEST);

    if (variableMap && res.slots) {
      // map request mappings to variables
      variables.merge(utils.mapSlots(variableMap, res.slots));
    }

    return nextId;
  },
});

export default () => CommandHandler(utilsObj);
