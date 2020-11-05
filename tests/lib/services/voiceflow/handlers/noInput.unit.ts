import { expect } from 'chai';
import sinon from 'sinon';

import { S } from '@/lib/constants';
import { NoInputHandler } from '@/lib/services/voiceflow/handlers/noInput';

describe('noInput handler unit tests', () => {
  describe('canHandle', () => {
    it('false', () => {
      expect(NoInputHandler().canHandle({ turn: { get: sinon.stub().returns(null) } } as any)).to.eql(false);
      expect(NoInputHandler().canHandle({ turn: { get: sinon.stub().returns({}) } } as any)).to.eql(false);
      expect(NoInputHandler().canHandle({ turn: { get: sinon.stub().returns({ payload: { intent: 'other intet' } }) } } as any)).to.eql(false);
    });
    it('true', () => {
      expect(NoInputHandler().canHandle({ turn: { get: sinon.stub().returns({ payload: { intent: 'actions.intent.NO_INPUT_1' } }) } } as any)).to.eql(
        true
      );
      expect(
        NoInputHandler().canHandle({ turn: { get: sinon.stub().returns({ payload: { intent: 'actions.intent.NO_INPUT_FINAL' } }) } } as any)
      ).to.eql(true);
    });
  });

  describe('handle', () => {
    it('with reprompt', () => {
      const reprompt = 'this is the reprompt msg';
      const block = {
        id: 'block-id',
      };
      const context = {
        storage: {
          produce: sinon.stub(),
          get: sinon.stub().returns(reprompt),
        },
      };

      const noInputHandler = NoInputHandler();
      expect(noInputHandler.handle(block as any, context as any)).to.eql(block.id);

      // assert produce
      const cb1 = context.storage.produce.args[0][0];
      // sets counter
      const draft = {
        [S.OUTPUT]: '',
      };
      cb1(draft);
      expect(draft).to.eql({ [S.OUTPUT]: reprompt });
    });

    it('without reprompt', () => {
      const output = 'this is the reprompt msg';
      const block = {
        id: 'block-id',
      };
      const context = {
        storage: {
          produce: sinon.stub(),
          get: sinon
            .stub()
            .withArgs(S.REPROMPT)
            .returns(null)
            .withArgs(S.OUTPUT)
            .returns(output),
        },
      };

      const noInputHandler = NoInputHandler();
      expect(noInputHandler.handle(block as any, context as any)).to.eql(block.id);

      // assert produce
      const cb1 = context.storage.produce.args[0][0];
      // sets counter
      const draft = {
        [S.OUTPUT]: '',
      };
      cb1(draft);
      expect(draft).to.eql({ [S.OUTPUT]: output });
    });
  });
});
