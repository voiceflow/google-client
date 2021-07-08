import { NodeType } from '@voiceflow/google-types/build/nodes/df-es/types';
import { expect } from 'chai';
import sinon from 'sinon';

import { T } from '@/lib/constants';
import DefaultImageHandler, { ImageHandler, ImageResponseBuilderDialogflowES } from '@/lib/services/runtime/handlers/df-es/image';

describe('df es image handler unit tests', async () => {
  afterEach(() => sinon.restore());

  describe('canHandle', () => {
    it('false', async () => {
      expect(DefaultImageHandler().canHandle({} as any, null as any, null as any, null as any)).to.eql(false);
    });

    it('true', async () => {
      expect(DefaultImageHandler().canHandle({ type: NodeType.IMAGE } as any, null as any, null as any, null as any)).to.eql(true);
    });
  });

  describe('handle', () => {
    it('type STANDARD with image', async () => {
      const utils = {
        addVariables: sinon.stub().returns('url'),
      };

      const imageHandler = ImageHandler(utils);

      const block = {
        imageUrl: '{image-url}',
        nextID: 'next-id',
      };
      const runtime = {
        turn: { set: sinon.stub() },
      };
      const variables = { foo: 'bar' };

      expect(imageHandler.handle(block as any, runtime as any, variables as any, null as any)).to.eql(block.nextID);

      expect(utils.addVariables.args).to.eql([[block.imageUrl, variables]]);
      expect(runtime.turn.set.args).to.eql([[T.DF_ES_IMAGE, { imageUrl: 'url' }]]);
    });
  });

  describe('responseBuilderDialogflowES', () => {
    it('no card', async () => {
      const runtime = {
        turn: { get: sinon.stub().returns(null) },
      };

      ImageResponseBuilderDialogflowES(runtime as any, null as any);

      expect(runtime.turn.get.args).to.eql([[T.DF_ES_IMAGE]]);
    });

    it('simple card', async () => {
      const image = {
        imageUrl: 'image-url',
      };

      const runtime = {
        turn: { get: sinon.stub().returns(image) },
      };

      const res = { fulfillmentMessages: [] };

      ImageResponseBuilderDialogflowES(runtime as any, res as any);

      expect(runtime.turn.get.args).to.eql([[T.DF_ES_IMAGE]]);
      expect(res.fulfillmentMessages).to.eql([
        {
          image: {
            imageUri: image.imageUrl,
            accessibilityText: 'image',
          },
        },
      ]);
    });
  });
});
