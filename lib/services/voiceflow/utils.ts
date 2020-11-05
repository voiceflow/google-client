import { SlotMapping } from '@voiceflow/general-types';
import { Context, formatIntentName, replaceVariables, Store, transformStringVariableToNumber } from '@voiceflow/runtime';

import { S, T } from '@/lib/constants';

export const mapSlots = (mappings: SlotMapping[], slots: { [key: string]: string }, overwrite = false): object => {
  const variables: Record<string, any> = {};

  if (mappings && slots) {
    mappings.forEach((map: SlotMapping) => {
      if (!map.slot) return;

      const toVariable = map.variable;
      const fromSlot = formatIntentName(map.slot);

      // extract slot value from request
      const fromSlotValue = slots[fromSlot] || null;

      if (toVariable && (fromSlotValue || overwrite)) {
        variables[toVariable] = transformStringVariableToNumber(fromSlotValue);
      }
    });
  }

  return variables;
};

export const addRepromptIfExists = <B extends { reprompt?: string }>(block: B, context: Context, variables: Store): void => {
  if (block.reprompt) {
    context.storage.set(S.REPROMPT, replaceVariables(block.reprompt, variables.getState()));
  }
};

export const addChipsIfExists = <B extends { chips?: string[] }>(block: B, context: Context, variables: Store): void => {
  if (block.chips) {
    context.turn.set(
      T.CHIPS,
      block.chips.map((chip) => replaceVariables(chip, variables.getState()))
    );
  }
};
