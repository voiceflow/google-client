import { WebhookClient as Agent } from 'dialogflow-fulfillment';
import { Request, Response } from 'express';
import randomstring from 'randomstring';

import { AbstractManager } from '../utils';
import { buildContext, initialize } from './handlers/lifecycle';

class GoogleManager extends AbstractManager {
  async dialogflowRequestHandler(agent: Agent) {
    const conv = agent.conv();

    if (!conv) {
      agent.add('Hello there! Unfortunately, this platform is currently not supported by Voiceflow.');
      return;
    }

    const input = conv.input.raw;

    // if (conv.query === 'actions_intent_MEDIA_STATUS') {
    //   input = 'continue';
    // } // Special case for google stream

    const { intent } = agent;
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

    /**
   * steps TODO:
   * 
   const context = await buildContext(input);

    await initialize(context, input);

    await update(context);

    return buildResponse(context, input);
   */

    const { userId } = conv.user.storage;

    // const session = await getSessionData(userId);
    const context = await buildContext(/* conv.body.versionID */ 'XwG14yqjQD', userId, this.services.voiceflow);

    if (intent === 'actions.intent.MAIN' || intent === 'Default Welcome Intent' || context.stack.isEmpty()) {
      // setUpNewSession(conv, session);
      await initialize(context);
      // session.oneShotIntent = intent;
    }

    // session.raw_input = input;
    // session.intent = intent;
    // session.slots = slots;

    await responseRender(conv, session);

    conv.user.storage.forceUpdateToken = randomstring.generate();
    agent.add(conv);
  }

  handleRequest(request: Request, response: Response) {
    const { WebhookClient } = this.services;

    request.body.versionID = request.params.versionID;

    const agent = new WebhookClient({
      request,
      response,
    });

    const intentMap = new Map();
    intentMap.set(null, this.dialogflowRequestHandler);

    return agent.handleRequest(intentMap);
  }
}

export default GoogleManager;
