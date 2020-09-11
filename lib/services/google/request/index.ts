import { ConversationV3 } from '@assistant/conversation';
import _ from 'lodash';

import { T, V } from '@/lib/constants';
import { RequestType } from '@/lib/services/voiceflow/types';

import { AbstractManager, injectServices } from '../../types';
import Context from './lifecycle/context';
import Initialize from './lifecycle/initialize';
import Response from './lifecycle/response';

@injectServices({ initialize: Initialize, context: Context, response: Response })
class HandlerManager extends AbstractManager<{ initialize: Initialize; context: Context; response: Response }> {
  async dialogflow(conv: ConversationV3) {
    const { initialize, context, response } = this.services;

    const { intent } = conv;
    const input = intent.query;

    const { slots } = conv.scene;

    const { userId } = conv.user.params;

    const newContext = await context.build(_.get(conv.request, 'versionID'), userId);

    if (intent === 'actions.intent.MAIN' || intent === 'Default Welcome Intent' || newContext.stack.isEmpty()) {
      await initialize.build(newContext, conv);
    } else {
      newContext.turn.set(T.REQUEST, {
        type: RequestType.INTENT,
        payload: {
          intent,
          input,
          slots,
        },
      });
    }

    newContext.variables.set(V.TIMESTAMP, Math.floor(Date.now() / 1000));
    await newContext.update();

    await response.build(newContext, conv);
  }
}

export default HandlerManager;
