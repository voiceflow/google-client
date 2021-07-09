import { replaceVariables } from '@voiceflow/common';
import { HandlerFactory } from '@voiceflow/general-runtime/build/runtime';
import { NodeType } from '@voiceflow/general-types/build/nodes/types';
import { ImageStepData, Node } from '@voiceflow/general-types/build/nodes/visual';

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
  canHandle: (node) => node.type === NodeType.VISUAL,
  handle: (node, runtime, variables) => {
    runtime.turn.set<TurnImage>(T.DF_ES_IMAGE, { imageUrl: utils.addVariables((node.data as ImageStepData).image!, variables) });

    return node.nextId ?? null;
  },
});

export default () => ImageHandler(utilsObj);
