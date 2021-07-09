import { replaceVariables } from '@voiceflow/common';
import { HandlerFactory } from '@voiceflow/general-runtime/build/runtime';
import { Node } from '@voiceflow/google-types/build/nodes/df-es/payload';
import { NodeType } from '@voiceflow/google-types/build/nodes/df-es/types';

import { T } from '@/lib/constants';

import { ResponseBuilderDialogflowES } from '../../types';
import { addVariables } from '../../utils';

type TurnPayload = {
  data: Record<string, any>;
};

export const PayloadResponseBuilderDialogflowES: ResponseBuilderDialogflowES = (runtime, res) => {
  const payload = runtime.turn.get<TurnPayload>(T.DF_ES_PAYLOAD);

  if (!payload) {
    return;
  }

  res.fulfillmentMessages.push({ payload: payload.data });
};

const utilsObj = {
  addVariables: addVariables(replaceVariables),
};

export const PayloadHandler: HandlerFactory<Node, typeof utilsObj> = (utils) => ({
  canHandle: (node) => node.type === NodeType.PAYLOAD,
  handle: (node, runtime, variables) => {
    const unparsedPayload = utils.addVariables(node.payload, variables);
    try {
      const data = JSON.parse(unparsedPayload) as TurnPayload['data'];
      runtime.turn.set<TurnPayload>(T.DF_ES_PAYLOAD, { data });
    } catch (err) {
      runtime.trace.debug(`invalid payload JSON:\n\`${unparsedPayload}\`\n\`${err}\``);
    }

    return node.nextID ?? null;
  },
});

export default () => PayloadHandler(utilsObj);
