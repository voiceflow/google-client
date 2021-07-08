import { CardType } from '@voiceflow/google-types/build/nodes/card';
import { expect } from 'chai';
import sinon from 'sinon';

import { T } from '@/lib/constants';
import DefaultCardHandler, {
  CardHandler,
  CardResponseBuilder,
  CardResponseBuilderDialogflowES,
  CardResponseBuilderGenerator,
  CardResponseBuilderGeneratorV2,
  CardResponseBuilderV2,
} from '@/lib/services/runtime/handlers/card';

describe('card handler unit tests', async () => {
  afterEach(() => sinon.restore());

  describe('canHandle', () => {
    it('false', async () => {
      const block = {};

      const result = DefaultCardHandler().canHandle(block as any, null as any, null as any, null as any);

      expect(result).to.eql(false);
    });

    it('true', async () => {
      const block = { card: { foo: 'bar' } };

      const result = DefaultCardHandler().canHandle(block as any, null as any, null as any, null as any);

      expect(result).to.eql(true);
    });
  });

  describe('handle', () => {
    it('no card type', async () => {
      const utils = {
        addVariables: sinon
          .stub()
          .onFirstCall()
          .returns('TEXT')
          .onSecondCall()
          .returns('TITLE'),
      };

      const cardHandler = CardHandler(utils);

      const block = {
        card: {
          title: 'title',
          text: 'text',
        },
        nextId: 'next-id',
      };
      const runtime = {
        turn: { set: sinon.stub() },
      };
      const variables = { foo: 'bar' };

      const result = cardHandler.handle(block as any, runtime as any, variables as any, null as any);

      expect(result).to.eql(block.nextId);
      expect(utils.addVariables.args[0]).to.eql([block.card.text, variables]);
      expect(utils.addVariables.args[1]).to.eql([block.card.title, variables]);
      expect(runtime.turn.set.args[0]).to.eql([
        T.CARD,
        {
          type: CardType.SIMPLE,
          title: 'TITLE',
          text: 'TEXT',
          image: {
            largeImageUrl: '',
          },
        },
      ]);
    });

    it('has card type', async () => {
      const utils = {
        addVariables: sinon.stub().returns(''),
      };

      const cardHandler = CardHandler(utils);

      const block = {
        card: {
          type: 'random-type',
        },
      };
      const runtime = {
        turn: { set: sinon.stub() },
      };
      const variables = { foo: 'bar' };

      cardHandler.handle(block as any, runtime as any, variables as any, null as any);

      expect(runtime.turn.set.args[0][1].type).to.eql(block.card.type);
    });

    it('type STANDARD but no image', async () => {
      const utils = {
        addVariables: sinon.stub().returns(''),
      };

      const cardHandler = CardHandler(utils);

      const block = {
        card: {
          type: CardType.STANDARD,
        },
      };
      const runtime = {
        turn: { set: sinon.stub() },
      };
      const variables = { foo: 'bar' };

      cardHandler.handle(block as any, runtime as any, variables as any, null as any);

      expect(runtime.turn.set.args[0][1].image).to.eql({ largeImageUrl: '' });
    });

    it('type STANDARD with image', async () => {
      const utils = {
        addVariables: sinon.stub().returns('url'),
      };

      const cardHandler = CardHandler(utils);

      const block = {
        card: {
          type: CardType.STANDARD,
          image: {
            largeImageUrl: 'random-url',
          },
        },
      };
      const runtime = {
        turn: { set: sinon.stub() },
      };
      const variables = { foo: 'bar' };

      cardHandler.handle(block as any, runtime as any, variables as any, null as any);

      expect(utils.addVariables.args[2]).to.eql([block.card.image.largeImageUrl, variables]);
      expect(runtime.turn.set.args[0][1].image).to.eql({ largeImageUrl: 'url' });
    });
  });

  describe('responseBuilder', () => {
    it('no card', async () => {
      const runtime = {
        turn: { get: sinon.stub().returns(null) },
      };

      CardResponseBuilder(runtime as any, null as any);

      expect(runtime.turn.get.args[0]).to.eql([T.CARD]);
    });

    it('unknow card type', async () => {
      const card = {
        type: 'random',
      };

      const runtime = {
        turn: { get: sinon.stub().returns(card) },
      };

      CardResponseBuilder(runtime as any, null as any);

      expect(runtime.turn.get.args[0]).to.eql([T.CARD]);
    });

    it('simple card', async () => {
      const card = {
        type: CardType.SIMPLE,
        text: 'CONTENT',
        title: 'TITLE',
      };

      const runtime = {
        turn: { get: sinon.stub().returns(card) },
      };

      const conv = { add: sinon.stub() };

      const CardBuilder = sinon.stub();

      CardResponseBuilderGenerator(CardBuilder as any, null as any)(runtime as any, conv as any);

      expect(runtime.turn.get.args[0]).to.eql([T.CARD]);
      expect(CardBuilder.args[0]).to.eql([
        {
          text: card.text,
          title: card.title,
        },
      ]);
      expect(conv.add.args[0]).to.eql([{}]);
    });

    it('standard card', async () => {
      const card = {
        type: CardType.STANDARD,
        title: 'TITLE',
        text: 'TEXT',
        image: {
          largeImageUrl: 'IMAGE URL',
        },
      };

      const runtime = {
        turn: { get: sinon.stub().returns(card) },
      };

      const conv = { add: sinon.stub() };

      const CardBuilder = sinon.stub();
      const ImageBuilder = sinon.stub();

      CardResponseBuilderGenerator(CardBuilder as any, ImageBuilder as any)(runtime as any, conv as any);

      expect(runtime.turn.get.args[0]).to.eql([T.CARD]);
      expect(ImageBuilder.args[0]).to.eql([
        {
          url: card.image.largeImageUrl,
          alt: 'Image',
        },
      ]);
      expect(CardBuilder.args[0]).to.eql([
        {
          text: card.text,
          title: card.title,
          image: {},
        },
      ]);
      expect(conv.add.args[0]).to.eql([{}]);
    });
  });

  describe('responseBuilderV2', () => {
    it('no card', async () => {
      const runtime = {
        turn: { get: sinon.stub().returns(null) },
      };

      CardResponseBuilderV2(runtime as any, null as any);

      expect(runtime.turn.get.args[0]).to.eql([T.CARD]);
    });

    it('unknow card type', async () => {
      const card = {
        type: 'random',
      };

      const runtime = {
        turn: { get: sinon.stub().returns(card) },
      };

      CardResponseBuilderV2(runtime as any, null as any);

      expect(runtime.turn.get.args[0]).to.eql([T.CARD]);
    });

    it('simple card', async () => {
      const card = {
        type: CardType.SIMPLE,
        title: 'TITLE',
        text: 'CONTENT',
      };

      const runtime = {
        turn: { get: sinon.stub().returns(card) },
      };

      const conv = { add: sinon.stub() };

      const CardBuilder = sinon.stub();

      CardResponseBuilderGeneratorV2(CardBuilder as any, null as any)(runtime as any, conv as any);

      expect(runtime.turn.get.args[0]).to.eql([T.CARD]);
      expect(CardBuilder.args[0]).to.eql([
        {
          text: card.text,
          title: card.title,
        },
      ]);
      expect(conv.add.args[0]).to.eql([{}]);
    });

    it('standard card', async () => {
      const card = {
        type: CardType.STANDARD,
        title: 'TITLE',
        text: 'TEXT',
        image: {
          largeImageUrl: 'IMAGE URL',
        },
      };

      const runtime = {
        turn: { get: sinon.stub().returns(card) },
      };

      const conv = { add: sinon.stub() };

      const CardBuilder = sinon.stub();
      const ImageBuilder = sinon.stub();

      CardResponseBuilderGeneratorV2(CardBuilder as any, ImageBuilder as any)(runtime as any, conv as any);

      expect(runtime.turn.get.args[0]).to.eql([T.CARD]);
      expect(ImageBuilder.args[0]).to.eql([
        {
          url: card.image.largeImageUrl,
          alt: 'Image',
        },
      ]);
      expect(CardBuilder.args[0]).to.eql([
        {
          text: card.text,
          title: card.title,
          image: {},
        },
      ]);
      expect(conv.add.args[0]).to.eql([{}]);
    });
  });

  describe('responseBuilderDialogflowES', () => {
    it('no card', async () => {
      const runtime = {
        turn: { get: sinon.stub().returns(null) },
      };

      CardResponseBuilderDialogflowES(runtime as any, null as any);

      expect(runtime.turn.get.args).to.eql([[T.CARD]]);
    });

    it('unknow card type', async () => {
      const card = {
        type: 'random',
      };

      const runtime = {
        turn: { get: sinon.stub().returns(card) },
      };

      CardResponseBuilderDialogflowES(runtime as any, null as any);

      expect(runtime.turn.get.args).to.eql([[T.CARD]]);
    });

    it('simple card', async () => {
      const card = {
        type: CardType.SIMPLE,
        title: 'TITLE',
        text: 'CONTENT',
      };

      const runtime = {
        turn: { get: sinon.stub().returns(card) },
      };

      const res = { fulfillmentMessages: [] };

      CardResponseBuilderDialogflowES(runtime as any, res as any);

      expect(runtime.turn.get.args).to.eql([[T.CARD]]);
      expect(res.fulfillmentMessages).to.eql([
        {
          card: {
            subtitle: card.text,
            title: card.title,
          },
        },
      ]);
    });

    it('standard card', async () => {
      const card = {
        type: CardType.STANDARD,
        title: 'TITLE',
        text: 'TEXT',
        image: {
          largeImageUrl: 'IMAGE URL',
        },
      };

      const runtime = {
        turn: { get: sinon.stub().returns(card) },
      };

      const res = { fulfillmentMessages: [] };

      CardResponseBuilderDialogflowES(runtime as any, res as any);

      expect(runtime.turn.get.args).to.eql([[T.CARD]]);
      expect(res.fulfillmentMessages).to.eql([{ card: { title: card.title, text: card.text, imageUri: card.image.largeImageUrl } }]);
    });
  });
});
