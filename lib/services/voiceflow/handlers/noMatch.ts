import { Node } from '@voiceflow/api-sdk';
import { Context, replaceVariables, sanitizeVariables, Store } from '@voiceflow/client';
import _ from 'lodash';

import { S } from '@/lib/constants';

type NoMatchNode = Node<any, { noMatches?: string[]; randomize?: boolean }>;

export const NoMatchHandler = () => ({
  canHandle: (node: NoMatchNode, context: Context) => {
    return Array.isArray(node.noMatches) && node.noMatches.length > (context.storage.get<number>(S.NO_MATCHES_COUNTER) ?? 0);
  },
  handle: (node: NoMatchNode, context: Context, variables: Store) => {
    context.storage.produce<{ [S.NO_MATCHES_COUNTER]: number }>((draft) => {
      draft[S.NO_MATCHES_COUNTER] = draft[S.NO_MATCHES_COUNTER] ? draft[S.NO_MATCHES_COUNTER] + 1 : 1;
    });

    const speak = (node.randomize ? _.sample(node.noMatches) : node.noMatches?.[context.storage.get<number>(S.NO_MATCHES_COUNTER)! - 1]) || '';

    const sanitizedVars = sanitizeVariables(variables.getState());
    // replaces var values
    const output = replaceVariables(speak, sanitizedVars);

    context.storage.produce((draft) => {
      draft[S.OUTPUT] += output;
    });

    return node.id;
  },
});

export default () => NoMatchHandler();
