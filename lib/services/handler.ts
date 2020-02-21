import { WebhookClient } from 'dialogflow-fulfillment';
import _ from 'lodash';

import { AbstractManager } from './utils';

class HandlerManager extends AbstractManager {
  async dialogflow(agent: WebhookClient) {
    try {
      const { lifecycle } = this.services;
      const conv = agent.conv();

      if (!conv) {
        agent.add('Hello there! Unfortunately, this platform is currently not supported by Voiceflow.');
        return;
      }

      // TODO
      // const input = conv.input.raw;
      // if (conv.query === 'actions_intent_MEDIA_STATUS') {
      //   input = 'continue';
      // } // Special case for google stream

      const { intent } = agent;

      // TODO
      // const slots = agent.parameters;
      // if (slots) {
      //   // Keep consistent with alexa
      //   for (const key in slots) {
      //     const slot_value = slots[key];
      //     slots[key] = {
      //       value: slot_value,
      //     };
      //   }
      // }

      const { userId } = conv.user.storage;

      // TODO: make user of userId for retrieving context and find a way to get skill_id here
      const context = await lifecycle.buildContext(_.get(conv.body, 'versionID'), userId);

      if (intent === 'actions.intent.MAIN' || intent === 'Default Welcome Intent' || context.stack.isEmpty()) {
        await lifecycle.initialize(context, conv);
      }

      // TODO
      // session.raw_input = input;
      // session.intent = intent;
      // session.slots = slots;

      await context.update();

      lifecycle.buildResponse(context, conv, agent);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('INNNER ERR: ', err);
    }
  }
}

export default HandlerManager;
