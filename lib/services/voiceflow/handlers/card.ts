import { Handler, Store } from '@voiceflow/client';
import { BasicCard, Image } from 'actions-on-google';

import { T } from '@/lib/constants';

import { ResponseBuilder } from '../types';
import { regexVariables } from '../utils';

enum CardType {
  STANDARD = 'Standard',
  SIMPLE = 'Simple',
}

type Card = {
  type?: CardType;
  title?: string;
  text?: string;
  content?: string;
  image?: {
    largeImageUrl: string;
  };
};

export type CardBlock = {
  card: Card;
  nextId: string;
};

export const CardResponseBuilder: ResponseBuilder = (context, conv) => {
  const card: Required<Card> | undefined = context.turn.get(T.CARD);

  if (!card) {
    return;
  }

  if (card.type === CardType.SIMPLE) {
    conv.add(
      new BasicCard({
        text: card.content,
        title: card.title,
      })
    );
  } else if (card.type === CardType.STANDARD) {
    conv.add(
      new BasicCard({
        text: card.text,
        title: card.title,
        image: new Image({
          url: card.image.largeImageUrl,
          alt: 'Image',
        }),
      })
    );
  }
};

const addVariables = (value: string | undefined, variables: Store, defaultValue = '') =>
  value ? regexVariables(value, variables.getState()) : defaultValue;

const utilsObj = {
  addVariables,
};

export const CardHandlerGenerator = (utils: typeof utilsObj): Handler<CardBlock> => {
  return {
    canHandle: (block) => {
      return !!block.card;
    },
    handle: (block, context, variables) => {
      const { card } = block;

      const newCard: Required<Card> = {
        type: card.type ?? CardType.SIMPLE,
        title: utils.addVariables(card.title, variables),
        text: utils.addVariables(card.text, variables),
        content: utils.addVariables(card.content, variables),
        image: {
          largeImageUrl: '',
        },
      };

      if (card.type === CardType.STANDARD && card.image?.largeImageUrl) {
        newCard.image.largeImageUrl = utils.addVariables(card.image.largeImageUrl, variables);
      }

      context.turn.set(T.CARD, newCard);

      return block.nextId;
    },
  };
};

const CardHandler = CardHandlerGenerator(utilsObj);

export default CardHandler;
