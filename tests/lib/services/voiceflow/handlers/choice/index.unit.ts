/* eslint-disable max-nested-callbacks */
import { expect } from 'chai';
import sinon from 'sinon';

import { T } from '@/lib/constants';
import DefaultChoiceHandler, {
  ChipsResponseBuilderGenerator,
  ChipsResponseBuilderGeneratorV2,
  ChoiceHandler,
} from '@/lib/services/voiceflow/handlers/choice';
import { RequestType } from '@/lib/services/voiceflow/types';

describe('choice handler unit tests', async () => {
  afterEach(() => sinon.restore());

  describe('canHandle', () => {
    it('false', async () => {
      const block = {};

      const result = DefaultChoiceHandler().canHandle(block as any, null as any, null as any, null as any);

      expect(result).to.eql(false);
    });

    it('true', async () => {
      const block = { choices: { foo: 'bar' } };

      const result = DefaultChoiceHandler().canHandle(block as any, null as any, null as any, null as any);

      expect(result).to.eql(true);
    });
  });

  describe('handle', () => {
    it('no request', () => {
      const utils = {
        addRepromptIfExists: sinon.stub(),
        addChipsIfExists: sinon.stub(),
      };
      const choiceHandler = ChoiceHandler(utils as any);

      const block = { id: 'block-id' };
      const context = { turn: { get: sinon.stub().returns(null) } };
      const variables = { var: '1' };

      expect(choiceHandler.handle(block as any, context as any, variables as any, null as any)).to.eql(block.id);
      expect(utils.addRepromptIfExists.args).to.eql([[block, context, variables]]);
      expect(utils.addChipsIfExists.args).to.eql([[block, context, variables]]);
    });

    it('request is not intent', () => {
      const utils = {
        addRepromptIfExists: sinon.stub(),
        addChipsIfExists: sinon.stub(),
      };
      const choiceHandler = ChoiceHandler(utils as any);

      const block = { id: 'block-id' };
      const context = { turn: { get: sinon.stub().returns({ type: 'random-type' }) } };
      const variables = { var: '1' };

      expect(choiceHandler.handle(block as any, context as any, variables as any, null as any)).to.eql(block.id);
      expect(utils.addRepromptIfExists.args).to.eql([[block, context, variables]]);
      expect(utils.addChipsIfExists.args).to.eql([[block, context, variables]]);
    });

    describe('request type is intent', () => {
      it('has score', () => {
        const utils = {
          getBestScore: sinon.stub().returns(1),
        };
        const choiceHandler = ChoiceHandler(utils as any);

        const block = {
          id: 'block-id',
          nextIds: ['one', 'two', 'three'],
          inputs: [
            ['no', 'nah'],
            ['yes', 'yeah'],
          ],
        };
        const request = {
          type: RequestType.INTENT,
          payload: { input: 'yup' },
        };
        const context = { turn: { get: sinon.stub().returns(request), delete: sinon.stub() } };
        const variables = { var: '1' };

        expect(choiceHandler.handle(block as any, context as any, variables as any, null as any)).to.eql(block.nextIds[1]);
        expect(utils.getBestScore.args).to.eql([
          [
            request.payload.input,
            [
              {
                index: 0,
                value: 'no',
              },
              {
                index: 0,
                value: 'nah',
              },
              {
                index: 1,
                value: 'yes',
              },
              {
                index: 1,
                value: 'yeah',
              },
            ],
          ],
        ]);
        expect(context.turn.delete.args).to.eql([[T.REQUEST]]);
      });

      describe('no score', () => {
        it('command can handle', () => {
          const output = 'random-id';

          const utils = {
            getBestScore: sinon.stub().returns(null),
            commandHandler: {
              canHandle: sinon.stub().returns(true),
              handle: sinon.stub().returns(output),
            },
          };
          const choiceHandler = ChoiceHandler(utils as any);

          const block = {
            id: 'block-id',
            inputs: [
              ['no', 'nah'],
              ['yes', 'yeah'],
            ],
          };
          const request = {
            type: RequestType.INTENT,
            payload: { input: 'yup' },
          };
          const context = { turn: { get: sinon.stub().returns(request) } };
          const variables = { var: '1' };

          expect(choiceHandler.handle(block as any, context as any, variables as any, null as any)).to.eql(output);
          expect(utils.commandHandler.canHandle.args).to.eql([[context]]);
          expect(utils.commandHandler.handle.args).to.eql([[context, variables]]);
        });

        describe('command cannot handle', () => {
          it('with elseId', () => {
            const utils = {
              getBestScore: sinon.stub().returns(null),
              commandHandler: {
                canHandle: sinon.stub().returns(false),
              },
            };
            const choiceHandler = ChoiceHandler(utils as any);

            const block = {
              id: 'block-id',
              elseId: 'else-id',
              inputs: [
                ['no', 'nah'],
                ['yes', 'yeah'],
              ],
            };
            const request = {
              type: RequestType.INTENT,
              payload: { input: 'yup' },
            };
            const context = { turn: { get: sinon.stub().returns(request), delete: sinon.stub() } };
            const variables = { var: '1' };

            expect(choiceHandler.handle(block as any, context as any, variables as any, null as any)).to.eql(block.elseId);
            expect(context.turn.delete.args).to.eql([[T.REQUEST]]);
          });

          it('without elseId', () => {
            const utils = {
              getBestScore: sinon.stub().returns(null),
              commandHandler: {
                canHandle: sinon.stub().returns(false),
              },
            };
            const choiceHandler = ChoiceHandler(utils as any);

            const block = {
              id: 'block-id',
              inputs: [
                ['no', 'nah'],
                ['yes', 'yeah'],
              ],
            };
            const request = {
              type: RequestType.INTENT,
              payload: { input: 'yup' },
            };
            const context = { turn: { get: sinon.stub().returns(request), delete: sinon.stub() } };
            const variables = { var: '1' };

            expect(choiceHandler.handle(block as any, context as any, variables as any, null as any)).to.eql(null);
            expect(context.turn.delete.args).to.eql([[T.REQUEST]]);
          });
        });
      });
    });
  });

  describe('responseBuilder', () => {
    it('no chips', () => {
      const SuggestionsBuilder = sinon.stub();

      const ChipsResponseBuilder = ChipsResponseBuilderGenerator(SuggestionsBuilder as any);

      const context = { turn: { get: sinon.stub().returns(null) } };
      ChipsResponseBuilder(context as any, null as any);

      expect(context.turn.get.args).to.eql([[T.CHIPS]]);
    });

    it('with chips', () => {
      const SuggestionsBuilder = sinon.stub();

      const ChipsResponseBuilder = ChipsResponseBuilderGenerator(SuggestionsBuilder as any);

      const chips = ['yes', 'no'];
      const context = { turn: { get: sinon.stub().returns(chips) } };
      const conv = { add: sinon.stub() };
      ChipsResponseBuilder(context as any, conv as any);

      expect(context.turn.get.args).to.eql([[T.CHIPS]]);
      expect(SuggestionsBuilder.args).to.eql([[chips]]);
      expect(conv.add.args).to.eql([[{}]]);
    });
  });

  describe('responseBuilderV2', () => {
    it('no chips', () => {
      const SuggestionsBuilder = sinon.stub();

      const ChipsResponseBuilderV2 = ChipsResponseBuilderGeneratorV2(SuggestionsBuilder as any);

      const context = { turn: { get: sinon.stub().returns(null) } };
      ChipsResponseBuilderV2(context as any, null as any);

      expect(context.turn.get.args).to.eql([[T.CHIPS]]);
    });

    it('with chips', () => {
      const SuggestionsBuilder = sinon
        .stub()
        .onFirstCall()
        .returns('yes')
        .onSecondCall()
        .returns('no');

      const ChipsResponseBuilderV2 = ChipsResponseBuilderGeneratorV2(SuggestionsBuilder as any);

      const chips = ['yes', 'no'];
      const context = { turn: { get: sinon.stub().returns(chips) } };
      const conv = { add: sinon.stub() };
      ChipsResponseBuilderV2(context as any, conv as any);

      expect(context.turn.get.args).to.eql([[T.CHIPS]]);
      expect(SuggestionsBuilder.args).to.eql([[{ title: 'yes' }], [{ title: 'no' }]]);
      expect(conv.add.args).to.eql([[{}], [{}]]);
    });
  });
});
