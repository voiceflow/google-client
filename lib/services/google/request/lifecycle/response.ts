import { ConversationV3, Simple } from '@assistant/conversation';
import { Context } from '@voiceflow/client';

import { S, T } from '@/lib/constants';
import { responseHandlers } from '@/lib/services/voiceflow/handlers';

import { AbstractManager, injectServices } from '../../../types';

const utilsObj = {
  responseHandlers,
  Simple,
};
@injectServices({ utils: utilsObj })
class ResponseManager extends AbstractManager<{ utils: typeof utilsObj }> {
  async build(context: Context, conv: ConversationV3) {
    const { state, randomstring, utils } = this.services;
    const { storage, turn } = context;

    if (context.stack.isEmpty()) {
      turn.set(T.END, true);
    }

    let displayText;

    if (
      storage
        .get(S.OUTPUT)
        .replace(/<[^><]+\/?>/g, '')
        .trim().length === 0
    ) {
      displayText = '🔊';
    }

    const response = new utils.Simple({
      speech: `<speak>${storage.get(S.OUTPUT)}</speak>`,
      text: displayText,
    });

    if (turn.get(T.END)) {
      conv.scene.next!.name = 'actions.scene.END_CONVERSATION';
      conv.add(response);
    } else {
      // conv.scene.next!.name = 'choice'; // this needs to be a response builder for 'interaction'
      // if we set intents as local to scene (no need if intents are global)!
      conv.add(response);
      // conv.noInputs = [
      //   {
      //     ssml: `<speak>${turn.get(T.REPROMPT) ?? storage.get(S.OUTPUT)}</speak>`,
      //   },
      // ];
    }

    // eslint-disable-next-line no-restricted-syntax
    // for (const handler of utils.responseHandlers) {
    //   // eslint-disable-next-line no-await-in-loop
    //   await handler(context, conv);
    // }

    await state.saveToDb(storage.get(S.USER), context.getFinalState());

    conv.user.params.forceUpdateToken = randomstring.generate();
  }
}

export default ResponseManager;
