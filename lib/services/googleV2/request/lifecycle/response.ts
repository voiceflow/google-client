import { ConversationV3, Simple } from '@assistant/conversation';

import { S, T } from '@/lib/constants';
import { responseHandlersV2 } from '@/lib/services/runtime/handlers';
import { GoogleRuntime } from '@/lib/services/runtime/types';
import { generateResponseText } from '@/lib/services/utils';

import { AbstractManager, injectServices } from '../../../types';

const utilsObj = {
  responseHandlersV2,
  Simple,
};

@injectServices({ utils: utilsObj })
class ResponseManager extends AbstractManager<{ utils: typeof utilsObj }> {
  async build(runtime: GoogleRuntime, conv: ConversationV3) {
    const { state, randomstring, utils } = this.services;
    const { storage, turn } = runtime;

    if (runtime.stack.isEmpty()) {
      turn.set(T.END, true);
    }

    const output = storage.get<string>(S.OUTPUT) ?? '';

    const response = new utils.Simple({
      speech: `<speak>${output}</speak>`,
      text: generateResponseText(output),
    });

    if (turn.get(T.END)) {
      conv.scene.next!.name = 'actions.scene.END_CONVERSATION';
    }

    conv.add(response);

    // eslint-disable-next-line no-restricted-syntax
    for (const handler of utils.responseHandlersV2) {
      // eslint-disable-next-line no-await-in-loop
      await handler(runtime, conv);
    }

    await state.saveToDb(storage.get<string>(S.USER)!, runtime.getFinalState());

    conv.user.params.forceUpdateToken = randomstring.generate();
  }
}

export default ResponseManager;
