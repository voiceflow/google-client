import { Node } from '@voiceflow/api-sdk';
import { replaceVariables, Runtime, sanitizeVariables, Store } from '@voiceflow/runtime';
import _ from 'lodash';

import { S } from '@/lib/constants';

type NoMatchNode = Node<any, { noMatches?: string[]; randomize?: boolean }>;

export const EMPTY_AUDIO_STRING = '<audio src=""/>';

const removeEmptyNoMatches = (noMatchArray?: string[]) => noMatchArray?.filter((noMatch) => noMatch != null && noMatch !== EMPTY_AUDIO_STRING);

export const NoMatchHandler = () => ({
  canHandle: (node: NoMatchNode, runtime: Runtime) => {
    const nonEmptyNoMatches = removeEmptyNoMatches(node.noMatches);

    return Array.isArray(nonEmptyNoMatches) && nonEmptyNoMatches.length > (runtime.storage.get<number>(S.NO_MATCHES_COUNTER) ?? 0);
  },
  handle: (node: NoMatchNode, runtime: Runtime, variables: Store) => {
    runtime.storage.produce<{ [S.NO_MATCHES_COUNTER]: number }>((draft) => {
      draft[S.NO_MATCHES_COUNTER] = draft[S.NO_MATCHES_COUNTER] ? draft[S.NO_MATCHES_COUNTER] + 1 : 1;
    });

    const nonEmptyNoMatches = removeEmptyNoMatches(node.noMatches);
    const speak = (node.randomize ? _.sample(nonEmptyNoMatches) : nonEmptyNoMatches?.[runtime.storage.get<number>(S.NO_MATCHES_COUNTER)! - 1]) || '';

    const sanitizedVars = sanitizeVariables(variables.getState());
    // replaces var values
    const output = replaceVariables(speak, sanitizedVars);

    runtime.storage.produce((draft) => {
      draft[S.OUTPUT] += output;
    });

    return node.id;
  },
});

export default () => NoMatchHandler();