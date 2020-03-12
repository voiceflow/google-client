import { expect } from 'chai';
import sinon from 'sinon';

import { T } from '@/lib/constants';
import CaptureHandler, { CaptureHandlerGenerator } from '@/lib/services/voiceflow/handlers/capture';
import { RequestType } from '@/lib/services/voiceflow/types';

describe('speak handler unit tests', async () => {
  afterEach(() => sinon.restore());

  describe('canHandle', () => {
    it('false', async () => {
      expect(CaptureHandler.canHandle({} as any, null as any, null as any, null as any)).to.eql(false);
    });

    it('true', async () => {
      expect(CaptureHandler.canHandle({ variable: 'var1' } as any, null as any, null as any, null as any)).to.eql(true);
    });
  });

  describe('handle', () => {
    it('no request', () => {
      const utils = {
        addChipsIfExists: sinon.stub(),
        addRepromptIfExists: sinon.stub(),
      };

      const captureHandler = CaptureHandlerGenerator(utils as any);

      const block = { blockID: 'block-id' };
      const context = { turn: { get: sinon.stub().returns(null) } };
      const variables = { foo: 'bar' };

      expect(captureHandler.handle(block as any, context as any, variables as any, null as any)).to.eql(block.blockID);
      expect(utils.addChipsIfExists.args).to.eql([[block, context, variables]]);
      expect(utils.addRepromptIfExists.args).to.eql([[block, context, variables]]);
    });

    it('request type not intent', () => {
      const utils = {
        addChipsIfExists: sinon.stub(),
        addRepromptIfExists: sinon.stub(),
      };

      const captureHandler = CaptureHandlerGenerator(utils as any);

      const block = { blockID: 'block-id' };
      const context = { turn: { get: sinon.stub().returns({ type: 'random' }) } };
      const variables = { foo: 'bar' };

      expect(captureHandler.handle(block as any, context as any, variables as any, null as any)).to.eql(block.blockID);
      expect(utils.addChipsIfExists.args).to.eql([[block, context, variables]]);
      expect(utils.addRepromptIfExists.args).to.eql([[block, context, variables]]);
    });

    describe('request type is intent', () => {
      it('command handler can handler', () => {
        const output = 'bar';

        const utils = {
          CommandHandler: {
            canHandle: sinon.stub().returns(true),
            handle: sinon.stub().returns(output),
          },
        };

        const captureHandler = CaptureHandlerGenerator(utils as any);

        const block = { blockID: 'block-id' };
        const context = { turn: { get: sinon.stub().returns({ type: RequestType.INTENT }) } };
        const variables = { foo: 'bar' };

        expect(captureHandler.handle(block as any, context as any, variables as any, null as any)).to.eql(output);
        expect(utils.CommandHandler.canHandle.args).to.eql([[context]]);
        expect(utils.CommandHandler.handle.args).to.eql([[context, variables]]);
      });
    });

    describe('command cant handle', () => {
      it('no input', () => {
        const utils = {
          CommandHandler: {
            canHandle: sinon.stub().returns(false),
          },
        };

        const captureHandler = CaptureHandlerGenerator(utils as any);

        const block = { nextId: 'next-id' };
        const request = { type: RequestType.INTENT, payload: { intent: null } };
        const context = { turn: { get: sinon.stub().returns(request), delete: sinon.stub() } };
        const variables = { foo: 'bar' };

        expect(captureHandler.handle(block as any, context as any, variables as any, null as any)).to.eql(block.nextId);
        expect(context.turn.delete.args).to.eql([[T.REQUEST]]);
      });

      it('input not number', () => {
        const word = 'not number';

        const utils = {
          CommandHandler: {
            canHandle: sinon.stub().returns(false),
          },
          wordsToNumbers: sinon.stub().returns(word),
        };

        const captureHandler = CaptureHandlerGenerator(utils as any);

        const block = { nextId: 'next-id', variable: 'var' };
        const request = { type: RequestType.INTENT, payload: { input: 'input' } };
        const context = { turn: { get: sinon.stub().returns(request), delete: sinon.stub() } };
        const variables = { set: sinon.stub() };

        expect(captureHandler.handle(block as any, context as any, variables as any, null as any)).to.eql(block.nextId);
        expect(utils.wordsToNumbers.args).to.eql([[request.payload.input]]);
        expect(variables.set.args).to.eql([[block.variable, request.payload.input]]);
        expect(context.turn.delete.args).to.eql([[T.REQUEST]]);
      });

      it('input is number', () => {
        const word = 1;

        const utils = {
          CommandHandler: {
            canHandle: sinon.stub().returns(false),
          },
          wordsToNumbers: sinon.stub().returns(word),
        };

        const captureHandler = CaptureHandlerGenerator(utils as any);

        const block = { variable: 'var' };
        const request = { type: RequestType.INTENT, payload: { input: 'input' } };
        const context = { turn: { get: sinon.stub().returns(request), delete: sinon.stub() } };
        const variables = { set: sinon.stub() };

        expect(captureHandler.handle(block as any, context as any, variables as any, null as any)).to.eql(null);
        expect(utils.wordsToNumbers.args).to.eql([[request.payload.input]]);
        expect(variables.set.args).to.eql([[block.variable, word]]);
        expect(context.turn.delete.args).to.eql([[T.REQUEST]]);
      });
    });
  });
});
