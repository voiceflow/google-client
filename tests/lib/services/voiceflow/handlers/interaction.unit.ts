import { expect } from 'chai';
import sinon from 'sinon';

import { S, T } from '@/lib/constants';
import DefaultInteractionHandler, { InteractionHandler } from '@/lib/services/voiceflow/handlers/interaction';
import { RequestType } from '@/lib/services/voiceflow/types';

describe('interaction handler unit tests', async () => {
  afterEach(() => sinon.restore());

  describe('canHandle', () => {
    it('false', async () => {
      expect(DefaultInteractionHandler().canHandle({} as any, null as any, null as any, null as any)).to.eql(false);
    });

    it('true', async () => {
      expect(DefaultInteractionHandler().canHandle({ interactions: { foo: 'bar' } } as any, null as any, null as any, null as any)).to.eql(true);
    });
  });

  describe('handle', () => {
    it('no request', () => {
      const utils = {
        addChipsIfExists: sinon.stub(),
        addRepromptIfExists: sinon.stub(),
      };

      const interactionHandler = InteractionHandler(utils as any);

      const block = { blockID: 'block-id' };
      const context = { turn: { get: sinon.stub().returns(null) }, storage: { delete: sinon.stub() } };
      const variables = { foo: 'bar' };

      expect(interactionHandler.handle(block as any, context as any, variables as any, null as any)).to.eql(block.blockID);
      expect(utils.addChipsIfExists.args).to.eql([[block, context, variables]]);
      expect(utils.addRepromptIfExists.args).to.eql([[block, context, variables]]);
      expect(context.storage.delete.args).to.eql([[S.NO_MATCHES_COUNTER]]);
    });

    it('request type not intent', () => {
      const utils = {
        addChipsIfExists: sinon.stub(),
        addRepromptIfExists: sinon.stub(),
      };

      const captureHandler = InteractionHandler(utils as any);

      const block = { blockID: 'block-id' };
      const context = { turn: { get: sinon.stub().returns({ type: 'random' }) }, storage: { delete: sinon.stub() } };
      const variables = { foo: 'bar' };

      expect(captureHandler.handle(block as any, context as any, variables as any, null as any)).to.eql(block.blockID);
      expect(utils.addChipsIfExists.args).to.eql([[block, context, variables]]);
      expect(utils.addRepromptIfExists.args).to.eql([[block, context, variables]]);
      expect(context.storage.delete.args).to.eql([[S.NO_MATCHES_COUNTER]]);
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

        const interactionHandler = InteractionHandler(utils as any);

        const block = { blockID: 'block-id', interactions: [] };
        const context = { turn: { get: sinon.stub().returns({ type: RequestType.INTENT, payload: {} }) } };
        const variables = { foo: 'bar' };

        expect(interactionHandler.handle(block as any, context as any, variables as any, null as any)).to.eql(output);
        expect(utils.commandHandler.canHandle.args).to.eql([[context]]);
        expect(utils.commandHandler.handle.args).to.eql([[context, variables]]);
      });

      describe('command cant handle', () => {
        it('no choice', () => {
          const utils = {
            formatName: sinon.stub().returns(false),
            commandHandler: {
              canHandle: sinon.stub().returns(false),
            },
            noMatchHandler: {
              canHandle: sinon.stub().returns(false),
            },
          };

          const interactionHandler = InteractionHandler(utils as any);

          const block = { blockID: 'block-id', interactions: [{ intent: 'intent1' }, { intent: 'intent2' }] };
          const request = { type: RequestType.INTENT, payload: { intent: 'random-intent' } };
          const context = { turn: { get: sinon.stub().returns(request), delete: sinon.stub() }, storage: { delete: sinon.stub() } };
          const variables = { foo: 'bar' };

          expect(interactionHandler.handle(block as any, context as any, variables as any, null as any)).to.eql(null);
          expect(utils.formatName.args).to.eql([[block.interactions[0].intent], [block.interactions[1].intent]]);
          expect(context.turn.delete.args).to.eql([[T.REQUEST]]);
        });

        it('no choice with elseId', () => {
          const utils = {
            formatName: sinon.stub().returns(false),
            commandHandler: {
              canHandle: sinon.stub().returns(false),
            },
            noMatchHandler: {
              canHandle: sinon.stub().returns(false),
            },
          };

          const interactionHandler = InteractionHandler(utils as any);

          const block = { blockID: 'block-id', elseId: 'else-id', interactions: [{ intent: 'intent1' }, { intent: 'intent2' }] };
          const request = { type: RequestType.INTENT, payload: { intent: 'random-intent' } };
          const context = { turn: { get: sinon.stub().returns(request), delete: sinon.stub() }, storage: { delete: sinon.stub() } };
          const variables = { foo: 'bar' };

          expect(interactionHandler.handle(block as any, context as any, variables as any, null as any)).to.eql(block.elseId);
        });

        it('no choice with noMatches', () => {
          const nextId = 'next-id';
          const noMatches = ['speak1', 'speak2', 'speak3'];

          const utils = {
            formatName: sinon.stub().returns(false),
            commandHandler: {
              canHandle: sinon.stub().returns(false),
            },
            noMatchHandler: {
              canHandle: sinon.stub().returns(true),
              handle: sinon.stub().returns(nextId),
            },
          };

          const interactionHandler = InteractionHandler(utils as any);

          const block = {
            blockID: 'block-id',
            interactions: [{ intent: 'intent1' }, { intent: 'intent2' }],
            noMatches,
          };
          const request = { type: RequestType.INTENT, payload: { intent: { name: 'random-intent' } } };
          const context = { turn: { get: sinon.stub().returns(request), delete: sinon.stub() } };
          const variables = { foo: 'bar' };

          expect(interactionHandler.handle(block as any, context as any, variables as any, null as any)).to.eql(nextId);
          expect(utils.formatName.args).to.eql([[block.interactions[0].intent], [block.interactions[1].intent]]);
          expect(context.turn.delete.args).to.eql([[T.REQUEST]]);
          expect(utils.noMatchHandler.canHandle.args).to.eql([[block, context]]);
          expect(utils.noMatchHandler.handle.args).to.eql([[block, context, variables]]);
        });

        it('choice without mappings', () => {
          const intentName = 'random-intent';

          const utils = {
            formatName: sinon.stub().returns(intentName),
            commandHandler: {
              canHandle: sinon.stub().returns(false),
            },
            noMatchHandler: {
              canHandle: sinon.stub().returns(false),
            },
          };

          const interactionHandler = InteractionHandler(utils as any);

          const block = { blockID: 'block-id', elseId: 'else-id', interactions: [{ intent: 'random-intent  ' }], nextIds: ['id-one'] };
          const request = { type: RequestType.INTENT, payload: { intent: intentName } };
          const context = { turn: { get: sinon.stub().returns(request), delete: sinon.stub() }, storage: { delete: sinon.stub() } };
          const variables = { foo: 'bar' };

          expect(interactionHandler.handle(block as any, context as any, variables as any, null as any)).to.eql(block.nextIds[0]);
        });

        it('choice without mappings but nextIdIndex', () => {
          const intentName = 'random-intent';

          const utils = {
            formatName: sinon.stub().returns(intentName),
            commandHandler: {
              canHandle: sinon.stub().returns(false),
            },
            noMatchHandler: {
              canHandle: sinon.stub().returns(false),
            },
          };

          const interactionHandler = InteractionHandler(utils as any);

          const block = {
            blockID: 'block-id',
            elseId: 'else-id',
            interactions: [{ intent: 'random-intent  ', nextIdIndex: 1 }],
            nextIds: ['id-one', 'id-two'],
          };
          const request = { type: RequestType.INTENT, payload: { intent: intentName } };
          const context = { turn: { get: sinon.stub().returns(request), delete: sinon.stub() }, storage: { delete: sinon.stub() } };
          const variables = { foo: 'bar' };

          expect(interactionHandler.handle(block as any, context as any, variables as any, null as any)).to.eql(block.nextIds[1]);
        });

        it('choice with mappings', () => {
          const intentName = 'random-intent';
          const mappedSlots = { slot1: 'slot-1' };

          const utils = {
            formatName: sinon.stub().returns(intentName),
            commandHandler: {
              canHandle: sinon.stub().returns(false),
            },
            noMatchHandler: {
              canHandle: sinon.stub().returns(false),
            },
            mapSlots: sinon.stub().returns(mappedSlots),
          };

          const interactionHandler = InteractionHandler(utils as any);

          const block = {
            blockID: 'block-id',
            elseId: 'else-id',
            interactions: [{ intent: 'random-intent  ', mappings: { foo: 'bar' } }],
            nextIds: ['id-one'],
          };
          const request = { type: RequestType.INTENT, payload: { intent: intentName, slots: { foo2: 'bar2' } } };
          const context = { turn: { get: sinon.stub().returns(request), delete: sinon.stub() }, storage: { delete: sinon.stub() } };
          const variables = { merge: sinon.stub() };

          expect(interactionHandler.handle(block as any, context as any, variables as any, null as any)).to.eql(block.nextIds[0]);
          expect(utils.mapSlots.args).to.eql([[block.interactions[0].mappings, request.payload.slots]]);
          expect(variables.merge.args).to.eql([[mappedSlots]]);
        });
      });
    });
  });
});
