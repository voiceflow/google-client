import { replaceVariables } from '@voiceflow/common';
import { HandlerFactory } from '@voiceflow/general-runtime/build/runtime';
import { Node } from '@voiceflow/google-types/build/nodes/df-es/image';
import { NodeType } from '@voiceflow/google-types/build/nodes/df-es/types';

import { T } from '@/lib/constants';

import { ResponseBuilderDialogflowES } from '../../types';
import { addVariables } from '../../utils';

type TurnImage = {
  imageUrl: string;
};

export const ImageResponseBuilderDialogflowES: ResponseBuilderDialogflowES = (runtime, res) => {
  const image = runtime.turn.get<TurnImage>(T.DF_ES_IMAGE);

  if (!image) {
    return;
  }

  res.fulfillmentMessages.push({ image: { imageUri: image.imageUrl, accessibilityText: 'image' } });
};

const utilsObj = {
  addVariables: addVariables(replaceVariables),
};

export const ImageHandler: HandlerFactory<Node, typeof utilsObj> = (utils) => ({
  canHandle: (node) => node.type === NodeType.IMAGE,
  handle: (node, runtime, variables) => {
    runtime.turn.set<TurnImage>(T.DF_ES_IMAGE, { imageUrl: utils.addVariables(node.imageUrl, variables) });

    return node.nextID ?? null;
  },
});

export default () => ImageHandler(utilsObj);
