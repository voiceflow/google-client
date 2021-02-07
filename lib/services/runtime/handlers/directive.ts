import { Prompt } from '@assistant/conversation';
import * as Schema from '@assistant/conversation/dist/api/schema';
import { replaceVariables } from '@voiceflow/common';
import { Node } from '@voiceflow/general-types/build/nodes/directive';
import { HandlerFactory } from '@voiceflow/runtime';

import { T } from '@/lib/constants';

import { ResponseBuilderV2 } from '../types';

export const DirectiveResponseBuilder: ResponseBuilderV2 = (runtime, conv) => {
  const directives = runtime.turn.get<any[]>(T.DIRECTIVES);
  if (!Array.isArray(directives)) return;

  // serialized prompt - ensure its not a class // immutable
  let nextPrompt = JSON.parse(JSON.stringify(conv.prompt)) as Schema.Prompt;

  // merge the existing prompts with a directive prompts
  directives.forEach((directive) => {
    if (typeof directive !== 'object') return;
    const { content, ...prompt } = directive;

    nextPrompt = {
      ...nextPrompt,
      ...prompt,
    };

    if (content) {
      nextPrompt.content = {
        ...nextPrompt.content,
        ...content,
      };
    }
  });

  // the constructor for Prompt and Content filter out invalid properties
  conv.prompt = new Prompt(nextPrompt);
};

const utilsObj = {
  replaceVariables,
};

export const DirectiveHandler: HandlerFactory<Node, typeof utilsObj> = (utils) => ({
  canHandle: (node) => !!node.directive,
  handle: (node, runtime, variables) => {
    const { directive: unparsedDirective } = node;

    const directiveString = utils.replaceVariables(unparsedDirective, variables.getState());

    try {
      const directive = JSON.parse(directiveString);
      const directives = runtime.turn.get<Record<string, any>[] | undefined>(T.DIRECTIVES);
      runtime.turn.set(T.DIRECTIVES, [...(directives || []), directive]);
      runtime.trace.debug(`sending directive JSON:\n\`${directiveString}\``);
    } catch (err) {
      runtime.trace.debug(`invalid directive JSON:\n\`${directiveString}\`\n\`${err}\``);
    }

    return node.nextId ?? null;
  },
});

export default () => DirectiveHandler(utilsObj);
