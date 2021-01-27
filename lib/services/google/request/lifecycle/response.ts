import { DialogflowConversation, SimpleResponse } from 'actions-on-google';
import { WebhookClient } from 'dialogflow-fulfillment';

import { S, T } from '@/lib/constants';
import { responseHandlers } from '@/lib/services/runtime/handlers';
import { GoogleRuntime } from '@/lib/services/runtime/types';
import { AbstractManager, injectServices } from '@/lib/services/types';
import { generateResponseText } from '@/lib/services/utils';

const utilsObj = {
  responseHandlers,
  SimpleResponse,
};

@injectServices({ utils: utilsObj })
class ResponseManager extends AbstractManager<{ utils: typeof utilsObj }> {
  async build(runtime: GoogleRuntime, agent: WebhookClient, conv: DialogflowConversation<any>) {
    const { state, randomstring, utils } = this.services;
    const { storage, turn } = runtime;

    if (runtime.stack.isEmpty()) {
      turn.set(T.END, true);
    }

    const output = storage.get<string>(S.OUTPUT)!;
    const response = new utils.SimpleResponse({
      speech: `<speak>${output}</speak>`,
      text: generateResponseText(output),
    });

    if (turn.get(T.END)) {
      conv.close(response);
    } else {
      conv.ask(response);
      conv.noInputs = [{ ssml: `<speak>${storage.get(S.REPROMPT) ?? output}</speak>` }];
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const handler of utils.responseHandlers) {
      // eslint-disable-next-line no-await-in-loop
      await handler(runtime, conv);
    }

    await state.saveToDb(storage.get<string>(S.USER)!, runtime.getFinalState());

    conv.user.storage.forceUpdateToken = randomstring.generate();
    agent.add(conv);
  }
}

export default ResponseManager;
