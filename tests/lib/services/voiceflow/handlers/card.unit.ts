// import { expect } from 'chai';
import sinon from 'sinon';

import { CardHandlerGenerator } from '@/lib/services/voiceflow/handlers/card';

describe('card handler unit tests', async () => {
  afterEach(() => sinon.restore());

  describe('handler', () => {
    it('works correctly', async () => {
      const utils = {
        addVariables: sinon.stub().returns(''),
      };

      const cardHandler = CardHandlerGenerator(utils);

      const block = {
        card: {
          type: '',
          title: '',
          text: '',
          content: '',
          image: {
            largeImageUrl: '',
          },
        },
      };
      const context = {
        turn: { set: sinon.stub() },
      };
      const variables = { foo: 'bar' };

      cardHandler.handle(block as any, context as any, variables as any, null as any);

      // todo: assertions
    });
  });
});
