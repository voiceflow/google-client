import { S, T } from '@/lib/constants';
import { responseHandlersDialogflowES } from '@/lib/services/runtime/handlers';
import { DirectiveResponseBuilder } from '@/lib/services/runtime/handlers/directive';
import { GoogleRuntime } from '@/lib/services/runtime/types';

import { AbstractManager, injectServices } from '../../../types';
import { WebhookResponse } from '../../types';

const utilsObj = {
  DirectiveResponseBuilder,
  responseHandlersDialogflowES,
};

@injectServices({ utils: utilsObj })
class ResponseManager extends AbstractManager<{ utils: typeof utilsObj }> {
  async build(runtime: GoogleRuntime) {
    const { state, utils } = this.services;
    const { storage, turn } = runtime;

    if (runtime.stack.isEmpty()) {
      turn.set(T.END, true);
    }

    const output = storage.get<string>(S.OUTPUT) ?? '';

    const res: WebhookResponse = {
      fulfillmentText: output,
      fulfillmentMessages: [{ text: { text: [output] } }],
      endInteraction: false,
    };

    if (turn.get(T.END)) {
      res.endInteraction = true;
    }

    /*
    res.fulfillmentMessages = [
      {
        text: { text: [output] },
      },
      {
        image: {
          imageUri: 'https://www.imagescanada.ca/wp-content/uploads/2019/03/Spectacular-Photos-of-Niagara-Falls-Casinos.jpg',
          accessibilityText: 'hotel',
        },
      },
      {
        quickReplies: {
          title: 'quick replies title?',
          quickReplies: ['quick1', 'quick2'],
        },
      },
      {
        card: {
          title: 'card title',
          subtitle: 'card subtitle',
          imageUri: 'https://www.imagescanada.ca/wp-content/uploads/2019/03/Spectacular-Photos-of-Niagara-Falls-Casinos.jpg',
          buttons: [
            { text: 'btn1', postback: 'postbakc1' },
            { text: 'btn2', postback: 'postbakc2' },
          ],
        },
      },
      {
        payload: {
          free-form for the user? any json and it's platform specific
        }
      }
    ];
    */

    // eslint-disable-next-line no-restricted-syntax
    for (const handler of utils.responseHandlersDialogflowES) {
      // eslint-disable-next-line no-await-in-loop
      await handler(runtime, res);
    }

    await state.saveToDb(storage.get<string>(S.USER)!, runtime.getFinalState());

    return res;
  }
}

export default ResponseManager;
