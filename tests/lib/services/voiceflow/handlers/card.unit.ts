// import { expect } from 'chai';
import sinon from 'sinon';

import { CardHandlerGenerator, CardResponseBuilder } from '@/lib/services/voiceflow/handlers/card';

describe('card handler unit tests', async () => {
  afterEach(() => sinon.restore());

  describe('canHandle', () => {
    it('works correctly', async () => {
      const utils = {
        addVariables: sinon.stub().returns(''),
      };

      const cardHandler = CardHandlerGenerator(utils);

      const block = {
        card: {
          foo: 'bar',
        },
      };

      cardHandler.canHandle(block as any, null as any, null as any, null as any);

      // todo: assertions
    });
  });

  describe('handle', () => {
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

  describe('responseBuilder', () => {
    it('works correctly', async () => {
      const context = {
        turn: { get: sinon.stub().returns(null) },
      };
      const conv = { add: sinon.stub() };

      CardResponseBuilder(context as any, conv as any);

      // todo: assertions
    });
  });
});
