import { ConversationV3, Simple } from '@assistant/conversation';
import { Context } from '@voiceflow/client';

import { S, T } from '@/lib/constants';
import { responseHandlersV2 } from '@/lib/services/voiceflow/handlers';

import { AbstractManager, injectServices } from '../../../types';

const utilsObj = {
  responseHandlersV2,
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

    const response = new utils.Simple({
      speech: `<speak>${storage.get(S.OUTPUT)}</speak>`,
    });

    if (turn.get(T.END)) {
      conv.scene.next!.name = 'actions.scene.END_CONVERSATION';
    }

    conv.add(response);

    // eslint-disable-next-line no-restricted-syntax
    for (const handler of utils.responseHandlersV2) {
      // eslint-disable-next-line no-await-in-loop
      await handler(context, conv);
    }

    await state.saveToDb(storage.get(S.USER), context.getFinalState());

    conv.user.params.forceUpdateToken = randomstring.generate();
  }
}

export default ResponseManager;
