import { expect } from 'chai';
import sinon from 'sinon';

import { T } from '@/lib/constants';
import DefaultCaptureHandler, { CaptureHandler } from '@/lib/services/runtime/handlers/capture';
import { RequestType } from '@/lib/services/runtime/types';

describe('capture handler unit tests', async () => {
  afterEach(() => sinon.restore());

  describe('canHandle', () => {
    it('false', async () => {
      expect(DefaultCaptureHandler().canHandle({} as any, null as any, null as any, null as any)).to.eql(false);
    });

    it('true', async () => {
      expect(DefaultCaptureHandler().canHandle({ variable: 'var1' } as any, null as any, null as any, null as any)).to.eql(true);
    });
  });

  describe('handle', () => {
    it('no request', () => {
      const utils = {
        addRepromptIfExists: sinon.stub(),
      };

      const captureHandler = CaptureHandler(utils as any);

      const block = { id: 'block-id' };
      const runtime = { turn: { get: sinon.stub().returns(null) } };
      const variables = { foo: 'bar' };

      expect(captureHandler.handle(block as any, runtime as any, variables as any, null as any)).to.eql(block.id);
      expect(utils.addRepromptIfExists.args).to.eql([[block, runtime, variables]]);
    });

    it('request type not intent', () => {
      const utils = {
        addRepromptIfExists: sinon.stub(),
      };

      const captureHandler = CaptureHandler(utils as any);

      const block = { id: 'block-id' };
      const runtime = { turn: { get: sinon.stub().returns({ type: 'random' }) } };
      const variables = { foo: 'bar' };

      expect(captureHandler.handle(block as any, runtime as any, variables as any, null as any)).to.eql(block.id);
      expect(utils.addRepromptIfExists.args).to.eql([[block, runtime, variables]]);
    });

    describe('request type is intent', () => {
      it('command handler can handle', () => {
        const output = 'bar';

        const utils = {
          commandHandler: {
            canHandle: sinon.stub().returns(true),
            handle: sinon.stub().returns(output),
          },
        };

        const captureHandler = CaptureHandler(utils as any);

        const block = { id: 'block-id' };
        const runtime = { turn: { get: sinon.stub().returns({ type: RequestType.INTENT }) } };
        const variables = { foo: 'bar' };

        expect(captureHandler.handle(block as any, runtime as any, variables as any, null as any)).to.eql(output);
        expect(utils.commandHandler.canHandle.args).to.eql([[runtime]]);
        expect(utils.commandHandler.handle.args).to.eql([[runtime, variables]]);
      });

      describe('command cant handle', () => {
        it('no input', () => {
          const utils = {
            commandHandler: {
              canHandle: sinon.stub().returns(false),
            },
          };

          const captureHandler = CaptureHandler(utils as any);

          const block = { nextId: 'next-id' };
          const request = { type: RequestType.INTENT, payload: { intent: null } };
          const runtime = { turn: { get: sinon.stub().returns(request), delete: sinon.stub() } };
          const variables = { foo: 'bar' };

          expect(captureHandler.handle(block as any, runtime as any, variables as any, null as any)).to.eql(block.nextId);
          expect(runtime.turn.delete.args).to.eql([[T.REQUEST]]);
        });

        it('input not number', () => {
          const word = 'not number';

          const utils = {
            commandHandler: {
              canHandle: sinon.stub().returns(false),
            },
            wordsToNumbers: sinon.stub().returns(word),
          };

          const captureHandler = CaptureHandler(utils as any);

          const block = { nextId: 'next-id', variable: 'var' };
          const request = { type: RequestType.INTENT, payload: { input: 'input' } };
          const runtime = { turn: { get: sinon.stub().returns(request), delete: sinon.stub() } };
          const variables = { set: sinon.stub() };

          expect(captureHandler.handle(block as any, runtime as any, variables as any, null as any)).to.eql(block.nextId);
          expect(utils.wordsToNumbers.args).to.eql([[request.payload.input]]);
          expect(variables.set.args).to.eql([[block.variable, request.payload.input]]);
          expect(runtime.turn.delete.args).to.eql([[T.REQUEST]]);
        });

        it('input is number', () => {
          const word = 1;

          const utils = {
            commandHandler: {
              canHandle: sinon.stub().returns(false),
            },
            wordsToNumbers: sinon.stub().returns(word),
          };

          const captureHandler = CaptureHandler(utils as any);

          const block = { variable: 'var' };
          const request = { type: RequestType.INTENT, payload: { input: 'input' } };
          const runtime = { turn: { get: sinon.stub().returns(request), delete: sinon.stub() } };
          const variables = { set: sinon.stub() };

          expect(captureHandler.handle(block as any, runtime as any, variables as any, null as any)).to.eql(null);
          expect(utils.wordsToNumbers.args).to.eql([[request.payload.input]]);
          expect(variables.set.args).to.eql([[block.variable, word]]);
          expect(runtime.turn.delete.args).to.eql([[T.REQUEST]]);
        });
      });
    });
  });
});
