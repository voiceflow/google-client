import { Context } from '@voiceflow/client';
import { DialogflowConversation, SimpleResponse } from 'actions-on-google';
import { WebhookClient } from 'dialogflow-fulfillment';

import { S, T } from '@/lib/constants';
import { AbstractManager, injectServices } from '@/lib/services/types';
import { generateResponseText } from '@/lib/services/utils';
import { responseHandlers } from '@/lib/services/voiceflow/handlers';

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

    const output = storage.get(S.OUTPUT);
    const response = new utils.SimpleResponse({
      speech: `<speak>${output}</speak>`,
      text: generateResponseText(output),
    });

    if (turn.get(T.END)) {
      conv.close(response);
    } else {
      conv.ask(response);
      conv.noInputs = [
        {
          ssml: `<speak>${turn.get(T.REPROMPT) ?? output}</speak>`,
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
