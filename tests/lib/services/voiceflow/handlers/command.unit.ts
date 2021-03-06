import { expect } from 'chai';
import sinon from 'sinon';

import { F, S, T } from '@/lib/constants';
import DefaultCommandHandler, { CommandHandler, getCommand } from '@/lib/services/runtime/handlers/command';
import { IntentName, RequestType } from '@/lib/services/runtime/types';

describe('command handler unit tests', async () => {
  afterEach(() => sinon.restore());

  describe('getCommand', () => {
    it('no request', () => {
      const runtime = { turn: { get: sinon.stub().returns(null) } };
      expect(getCommand(runtime as any, null as any)).to.eql(null);
    });

    it('request type not intent', () => {
      const runtime = { turn: { get: sinon.stub().returns({ type: 'random type' }) } };
      expect(getCommand(runtime as any, null as any)).to.eql(null);
    });

    describe('request type intent', () => {
      it('VoiceFlowIntent', () => {
        const runtime = { turn: { get: sinon.stub().returns({ type: RequestType.INTENT, payload: { intent: IntentName.VOICEFLOW } }) } };
        expect(getCommand(runtime as any, null as any)).to.eql(null);
      });

      it('no extracted frame', () => {
        const runtime = {
          stack: { foo: 'bar' },
          turn: { get: sinon.stub().returns({ type: RequestType.INTENT, payload: { intent: 'random_intent' } }) },
        };
        const extraFrameCommand = sinon.stub().returns(null);

        expect(getCommand(runtime as any, extraFrameCommand as any)).to.eql(null);
        expect(extraFrameCommand.args[0][0]).to.eql(runtime.stack);

        // assert matcher
        const matcher = extraFrameCommand.args[0][1];
        expect(typeof matcher).to.eql('function');
        expect(matcher(null)).to.eql(false);
        expect(matcher({ intent: 'other' })).to.eql(false);
        expect(matcher({ intent: 'random_intent' })).to.eql(true);
      });

      it('with extracted frame', () => {
        const payload = { intent: 'random_intent', slots: ['slot1', 'slot2'] };
        const runtime = {
          stack: { foo: 'bar' },
          turn: { get: sinon.stub().returns({ type: RequestType.INTENT, payload }) },
        };
        const frame = { random: '123' };
        const extraFrameCommand = sinon.stub().returns(frame);

        expect(getCommand(runtime as any, extraFrameCommand as any)).to.eql({ ...frame, intent: payload.intent, slots: payload.slots });
      });
    });
  });

  describe('canHandle', () => {
    it('false', () => {
      expect(CommandHandler({ getCommand: sinon.stub().returns(null) } as any).canHandle(null as any)).to.eql(false);
    });
    it('true', () => {
      expect(CommandHandler({ getCommand: sinon.stub().returns({ foo: 'bar' }) } as any).canHandle(null as any)).to.eql(true);
    });
  });

  describe('handle', () => {
    it('no command obj', () => {
      const commandHandler = CommandHandler({ getCommand: sinon.stub().returns(null) } as any);

      expect(commandHandler.handle(null as any, null as any)).to.eql(null);
    });

    it('no command', () => {
      const commandHandler = CommandHandler({ getCommand: sinon.stub().returns({}) } as any);

      const runtime = { turn: { delete: sinon.stub() } };

      expect(commandHandler.handle(runtime as any, null as any)).to.eql(null);
      expect(runtime.turn.delete.args).to.eql([[T.REQUEST]]);
    });

    describe('has command', () => {
      it('no diagram_id or next', () => {
        const commandHandler = CommandHandler({ getCommand: sinon.stub().returns({ command: {} }) } as any);

        const runtime = { turn: { delete: sinon.stub() } };

        expect(commandHandler.handle(runtime as any, null as any)).to.eql(null);
      });

      it('mappings but no slots', () => {
        const commandHandler = CommandHandler({ getCommand: sinon.stub().returns({ command: { mappings: [] } }) } as any);

        const runtime = { turn: { delete: sinon.stub() } };

        expect(commandHandler.handle(runtime as any, null as any)).to.eql(null);
      });

      it('slots but no mappings', () => {
        const commandHandler = CommandHandler({ getCommand: sinon.stub().returns({ command: { slots: {} } }) } as any);

        const runtime = { turn: { delete: sinon.stub() } };

        expect(commandHandler.handle(runtime as any, null as any)).to.eql(null);
      });

      it('mappings and slots', () => {
        const mappedSlots = { foo: 'bar' };
        const res = { slots: { slot1: 'slot_one' }, command: { mappings: [{ slot: 'slot', variable: 'variable' }] } };
        const utils = {
          mapSlots: sinon.stub().returns(mappedSlots),
          getCommand: sinon.stub().returns(res),
        };

        const commandHandler = CommandHandler(utils as any);

        const runtime = { turn: { delete: sinon.stub() } };
        const variables = { merge: sinon.stub() };

        expect(commandHandler.handle(runtime as any, variables as any)).to.eql(null);
        expect(utils.mapSlots.args).to.eql([[res.command.mappings, res.slots]]);
        expect(variables.merge.args).to.eql([[mappedSlots]]);
      });

      it('diagram_id', () => {
        const res = { command: { diagram_id: 'diagram-id' } };
        const utils = { getCommand: sinon.stub().returns(res), Frame: sinon.stub() };

        const commandHandler = CommandHandler(utils as any);

        const topFrame = { storage: { set: sinon.stub() } };
        const runtime = { stack: { push: sinon.stub(), top: sinon.stub().returns(topFrame) }, turn: { delete: sinon.stub() } };

        expect(commandHandler.handle(runtime as any, null as any)).to.eql(null);
        expect(topFrame.storage.set.args).to.eql([[F.CALLED_COMMAND, true]]);
        expect(utils.Frame.args).to.eql([[{ programID: res.command.diagram_id }]]);
        expect(runtime.stack.push.args).to.eql([[{}]]);
      });

      describe('next', () => {
        it('last frame in stack', () => {
          const stackSize = 3;

          const res = { command: { next: 'next-id' }, index: stackSize - 1 };
          const utils = { getCommand: sinon.stub().returns(res) };
          const commandHandler = CommandHandler(utils as any);

          const runtime = { turn: { delete: sinon.stub() }, stack: { getSize: sinon.stub().returns(stackSize) }, storage: { set: sinon.stub() } };

          expect(commandHandler.handle(runtime as any, null as any)).to.eql(res.command.next);
          expect(runtime.storage.set.args).to.eql([[S.OUTPUT, '']]);
        });

        it('not last frame', () => {
          const index = 1;
          const res = { command: { next: 'next-id' }, index };
          const utils = { getCommand: sinon.stub().returns(res) };
          const commandHandler = CommandHandler(utils as any);

          const topFrame = { setNodeID: sinon.stub() };
          const runtime = {
            turn: { delete: sinon.stub() },
            stack: { getSize: sinon.stub().returns(3), top: sinon.stub().returns(topFrame), popTo: sinon.stub() },
          };

          expect(commandHandler.handle(runtime as any, null as any)).to.eql(null);
          expect(runtime.stack.popTo.args).to.eql([[index + 1]]);
          expect(topFrame.setNodeID.args).to.eql([[res.command.next]]);
        });

        it('index bigger than stack size', () => {
          const res = { command: { next: 'next-id' }, index: 4 };
          const utils = { getCommand: sinon.stub().returns(res) };
          const commandHandler = CommandHandler(utils as any);

          const runtime = {
            turn: { delete: sinon.stub() },
            stack: { getSize: sinon.stub().returns(3) },
          };

          expect(commandHandler.handle(runtime as any, null as any)).to.eql(null);
        });
      });
    });
  });

  describe('generation', () => {
    it('works correctly', () => {
      const runtime = { turn: { get: sinon.stub().returns(null) } };
      expect(DefaultCommandHandler().canHandle(runtime as any)).to.eql(false);
    });
  });
});
