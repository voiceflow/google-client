import { S, T } from '@/lib/constants';
import { responseHandlersV2 } from '@/lib/services/runtime/handlers';
import { DirectiveResponseBuilder } from '@/lib/services/runtime/handlers/directive';
import { GoogleRuntime } from '@/lib/services/runtime/types';

// import { generateResponseText } from '@/lib/services/utils';
import { AbstractManager, injectServices } from '../../types';
// import { WebhookRequest } from '../types';

const utilsObj = {
  DirectiveResponseBuilder,
  responseHandlersV2,
};

@injectServices({ utils: utilsObj })
class ResponseManager extends AbstractManager<{ utils: typeof utilsObj }> {
  async build(runtime: GoogleRuntime) {
    const { state /* , randomstring , utils */ } = this.services;
    const { storage, turn } = runtime;
    const res: any = {};

    if (runtime.stack.isEmpty()) {
      turn.set(T.END, true);
    }

    const output = storage.get<string>(S.OUTPUT) ?? '';
    // console.log('speak', output);

    // const response = new utils.Simple({
    //   speech: `<speak>${output}</speak>`,
    //   text: generateResponseText(output),
    // });

    if (turn.get(T.END)) {
      res.endInteraction = true;
    }

    // conv.add(response);
    res.fulfillmentText = output;
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
      /*
      {
        payload: {
          free-form for the user? any json and it's platform specific
        }
      }
      */
    ];

    /*
    // eslint-disable-next-line no-restricted-syntax
    for (const handler of utils.responseHandlersV2) {
      // eslint-disable-next-line no-await-in-loop
      await handler(runtime, conv);
    }
    */

    await state.saveToDb(storage.get<string>(S.USER)!, runtime.getFinalState());

    // conv.user.params.forceUpdateToken = randomstring.generate();

    return res;
  }
}

export default ResponseManager;
