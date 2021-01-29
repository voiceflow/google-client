import { replaceVariables, sanitizeVariables } from '@voiceflow/common';
import { Node } from '@voiceflow/general-types/build/nodes/speak';
import { HandlerFactory } from '@voiceflow/runtime';
import _ from 'lodash';

import { F, S } from '@/lib/constants';

const SpeakHandler: HandlerFactory<Node> = () => ({
  canHandle: (node) => {
    return ('random_speak' in node ? !!node.random_speak : !!node.speak) || (_.isString(node.prompt) && node.prompt !== 'true');
  },
  handle: (node, runtime, variables) => {
    let speak = '';

    // Pick a random part to speak
    if ('random_speak' in node && Array.isArray(node.random_speak)) {
      speak = _.sample(node.random_speak) ?? '';
    } else if ('speak' in node) {
      ({ speak } = node);
    }

    const sanitizedVars = sanitizeVariables(variables.getState());

    if (_.isString(speak)) {
      const output = replaceVariables(speak, sanitizedVars);

      runtime.storage.produce<{ [S.OUTPUT]: string }>((draft) => {
        draft[S.OUTPUT] += output;
      });

      runtime.stack.top().storage.set(F.SPEAK, output);
    }

    return node.nextId ?? null;
  },
});

export default SpeakHandler;
