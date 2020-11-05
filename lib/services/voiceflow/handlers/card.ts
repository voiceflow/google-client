import { Card as GoogleCard, Image as GoogleImage } from '@assistant/conversation';
import { Card, CardType, Node } from '@voiceflow/google-types/build/nodes/card';
import { HandlerFactory, replaceVariables, Store } from '@voiceflow/runtime';
import { BasicCard, Image } from 'actions-on-google';

import { T } from '@/lib/constants';

import { ResponseBuilder, ResponseBuilderV2 } from '../types';

export const CardResponseBuilderGenerator = (CardBuilder: typeof BasicCard, ImageBuilder: typeof Image): ResponseBuilder => (context, conv) => {
  const card = context.turn.get<Card>(T.CARD);

  if (!card) {
    return;
  }

  if (card.type === CardType.SIMPLE) {
    conv.add(new CardBuilder({ text: card.text, title: card.title }));
  } else if (card.type === CardType.STANDARD) {
    conv.add(
      new CardBuilder({
        text: card.text,
        title: card.title,
        image: new ImageBuilder({ url: card.image?.largeImageUrl ?? '', alt: 'Image' }),
      })
    );
  }
};

export const CardResponseBuilder = CardResponseBuilderGenerator(BasicCard, Image);

export const CardResponseBuilderGeneratorV2 = (CardBuilder: typeof GoogleCard, ImageBuilder: typeof GoogleImage): ResponseBuilderV2 => (
  context,
  conv
) => {
  const card = context.turn.get<Card>(T.CARD);

  if (!card) {
    return;
  }

  if (card.type === CardType.SIMPLE) {
    conv.add(new CardBuilder({ text: card.text, title: card.title }));
  } else if (card.type === CardType.STANDARD) {
    conv.add(
      new CardBuilder({
        text: card.text,
        title: card.title,
        image: new ImageBuilder({ url: card.image?.largeImageUrl, alt: 'Image' }),
      })
    );
  }
};

export const CardResponseBuilderV2 = CardResponseBuilderGeneratorV2(GoogleCard, GoogleImage);

export const addVariables = (regex: typeof replaceVariables) => (value: string | undefined, variables: Store, defaultValue = '') =>
  value ? regex(value, variables.getState()) : defaultValue;

const utilsObj = {
  addVariables: addVariables(replaceVariables),
};

export const CardHandler: HandlerFactory<Node, typeof utilsObj> = (utils) => ({
  canHandle: (node) => !!node.card,
  handle: (node, context, variables) => {
    const { card } = node;
    const type = card.type ?? CardType.SIMPLE;

    // FIXME: remove after data refactoring
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const { content } = card;

    const text = (type === CardType.SIMPLE ? content : card.text) ?? card.text;

    const newCard: Required<Card> = {
      type: card.type ?? CardType.SIMPLE,
      text: utils.addVariables(text, variables),
      title: utils.addVariables(card.title, variables),
      image: { largeImageUrl: '' },
    };

    if (card.type === CardType.STANDARD && card.image?.largeImageUrl) {
      newCard.image.largeImageUrl = utils.addVariables(card.image.largeImageUrl, variables);
    }

    context.turn.set(T.CARD, newCard);

    return node.nextId ?? null;
  },
});

export default () => CardHandler(utilsObj);
