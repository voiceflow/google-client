import { Event, RequestType } from '@/lib/clients/ingest-client';
import { S, T } from '@/lib/constants';
import { responseHandlersDialogflowES } from '@/lib/services/runtime/handlers';
import { GoogleRuntime } from '@/lib/services/runtime/types';

import { AbstractManager, injectServices } from '../../../types';
import { WebhookResponse } from '../../types';

const utilsObj = {
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

    // eslint-disable-next-line no-restricted-syntax
    for (const handler of utils.responseHandlersDialogflowES) {
      // eslint-disable-next-line no-await-in-loop
      await handler(runtime, res);
    }
    await state.saveToDb(storage.get<string>(S.USER)!, runtime.getFinalState());
    // Track response on analytics system
    runtime.services.analyticsClient.track(
      runtime.getVersionID(),
      Event.INTERACT,
      RequestType.RESPONSE,
      res,
      runtime.getFinalState().storage.user,
      runtime.getFinalState()
    );

    return res;
  }
}

export default ResponseManager;
