import { Nullable, SlotMapping } from '@voiceflow/api-sdk';
import { replaceVariables, SLOT_REGEXP, transformStringVariableToNumber } from '@voiceflow/common';
import { Runtime, Store } from '@voiceflow/general-runtime/build/runtime';
import { AnyRequestButton, Chip } from '@voiceflow/general-types';
import _ from 'lodash';

import { S, T } from '@/lib/constants';

type GoogleDateTimeSlot = {
  seconds: number;
  day: number;
  hours: number;
  nanos: number;
  year: number;
  minutes: number;
  month: number;
};

export const transformDateTimeVariableToString = (date: GoogleDateTimeSlot) => {
  if (!date.year && !date.hours) return ''; // not GoogleDateTime type

  // time type
  if (!date.year) return `${date.hours}:${date.minutes}`;

  // date type
  if (!date.hours) return `${date.day}/${date.month}/${date.year}`;

  // datetime type
  return `${date.day}/${date.month}/${date.year} ${date.hours}:${date.minutes ?? '00'}`;
};

export const mapSlots = (mappings: SlotMapping[], slots: { [key: string]: string }, overwrite = false): object => {
  const variables: Record<string, any> = {};

  if (mappings && slots) {
    mappings.forEach((map: SlotMapping) => {
      if (!map.slot) return;

      const toVariable = map.variable;
      const fromSlot = map.slot;

      // extract slot value from request
      const fromSlotValue = slots[fromSlot] || null;

      if (toVariable && (fromSlotValue || overwrite)) {
        variables[toVariable] = _.isObject(fromSlotValue)
          ? transformDateTimeVariableToString(fromSlotValue)
          : transformStringVariableToNumber(fromSlotValue);
      }
    });
  }

  return variables;
};

export const addRepromptIfExists = <B extends { reprompt?: string }>(block: B, runtime: Runtime, variables: Store): void => {
  if (block.reprompt) {
    runtime.storage.set(S.REPROMPT, replaceVariables(block.reprompt, variables.getState()));
  }
};

export const addChipsIfExistsV1 = <B extends { chips?: string[] }>(block: B, runtime: Runtime, variables: Store): void => {
  if (block.chips) {
    runtime.turn.set(
      T.CHIPS,
      block.chips.map((chip) => replaceVariables(chip, variables.getState()))
    );
  }
};

export const replaceIDVariables = (input: string, variables: Record<string, string>) =>
  input.replace(SLOT_REGEXP, (_match, inner) => variables[inner] || inner);

export const addChipsIfExists = <N extends { chips?: Chip[]; buttons?: Nullable<AnyRequestButton[]> }>(
  node: N,
  runtime: Runtime,
  variables: Store
): void => {
  if (node.buttons) {
    runtime.turn.set(
      T.CHIPS,
      node.buttons.map((button) => replaceIDVariables(button.name, variables.getState()))
    );
  } else if (node.chips) {
    runtime.turn.set(
      T.CHIPS,
      node.chips.map((chip) => replaceIDVariables(chip?.label, variables.getState()))
    );
  }
};

export const addVariables = (regex: typeof replaceVariables) => (value: string | undefined, variables: Store, defaultValue = '') =>
  value ? regex(value, variables.getState()) : defaultValue;
