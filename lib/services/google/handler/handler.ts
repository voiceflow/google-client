import { WebhookClient } from 'dialogflow-fulfillment';
import _ from 'lodash';

import { T } from '@/lib/constants';
import { RequestType } from '@/lib/services/voiceflow/types';

import { AbstractManager } from '../../utils';
import Context from './lifecycle/context';
import Initialize from './lifecycle/initialize';
import Response from './lifecycle/response';

class HandlerManager extends AbstractManager<{ initialize: Initialize; context: Context; response: Response }> {
  async dialogflow(agent: WebhookClient) {
    const { initialize, context, response } = this.services;
    const conv = agent.conv();

    if (!conv) {
      agent.add('Hello there! Unfortunately, this platform is currently not supported by Voiceflow.');
      return;
    }

    const input = conv.input.raw;
    // TODO: stream
    // if (conv.query === 'actions_intent_MEDIA_STATUS') {
    //   input = 'continue';
    // } // Special case for google stream

    const { intent } = agent;

    const { parameters: slots } = agent;

    const { userId } = conv.user.storage;

    const newContext = await context.build(_.get(conv.body, 'versionID'), userId);

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

    await newContext.update();

    await response.build(newContext, agent, conv);
  }
}

export default HandlerManager;
