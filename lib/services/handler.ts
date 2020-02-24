import { WebhookClient } from 'dialogflow-fulfillment';
import _ from 'lodash';

import { AbstractManager } from './utils';

class HandlerManager extends AbstractManager {
  async dialogflow(agent: WebhookClient) {
    const { lifecycle } = this.services;
    const conv = agent.conv();

    if (!conv) {
      agent.add('Hello there! Unfortunately, this platform is currently not supported by Voiceflow.');
      return;
    }

    // TODO
    const input = conv.input.raw;
    // if (conv.query === 'actions_intent_MEDIA_STATUS') {
    //   input = 'continue';
    // } // Special case for google stream

    const { intent } = agent;

    const { parameters: slots } = agent;

    const { userId } = conv.user.storage;

    const context = await lifecycle.buildContext(_.get(conv.body, 'versionID'), userId);

    if (intent === 'actions.intent.MAIN' || intent === 'Default Welcome Intent' || context.stack.isEmpty()) {
      await lifecycle.initialize(context, conv);
    } else {
      // todo: store this in a nicer manner
      context.turn.set('intentRequest', {
        intent,
        input,
        slots,
      });
    }

    await context.update();

    await lifecycle.buildResponse(context, agent, conv);
  }
}

export default HandlerManager;
