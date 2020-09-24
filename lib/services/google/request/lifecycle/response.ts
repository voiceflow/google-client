import { Context } from '@voiceflow/client';
import { DialogflowConversation, SimpleResponse } from 'actions-on-google';
import { WebhookClient } from 'dialogflow-fulfillment';

import { S, T } from '@/lib/constants';
import { responseHandlers } from '@/lib/services/voiceflow/handlers';

import { AbstractManager, injectServices } from '../../../types';

const utilsObj = {
  responseHandlers,
  SimpleResponse,
};
@injectServices({ utils: utilsObj })
class ResponseManager extends AbstractManager<{ utils: typeof utilsObj }> {
  async build(context: Context, agent: WebhookClient, conv: DialogflowConversation<any>) {
    const { state, randomstring, utils } = this.services;
    const { storage, turn } = context;

    if (context.stack.isEmpty()) {
      turn.set(T.END, true);
    }

    const response = new utils.SimpleResponse({
      speech: `<speak>${storage.get(S.OUTPUT)}</speak>`,
    });

    if (turn.get(T.END)) {
      conv.close(response);
    } else {
      conv.ask(response);
      conv.noInputs = [
        {
          ssml: `<speak>${turn.get(T.REPROMPT) ?? storage.get(S.OUTPUT)}</speak>`,
        },
      ];
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const handler of utils.responseHandlers) {
      // eslint-disable-next-line no-await-in-loop
      await handler(context, conv);
    }

    await state.saveToDb(storage.get(S.USER), context.getFinalState());

    conv.user.storage.forceUpdateToken = randomstring.generate();
    agent.add(conv);
  }
}

export default ResponseManager;
