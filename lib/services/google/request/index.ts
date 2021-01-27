import { WebhookClient } from 'dialogflow-fulfillment';
import _ from 'lodash';

import { T, V } from '@/lib/constants';
import { RequestType } from '@/lib/services/runtime/types';

import { AbstractManager, injectServices } from '../../types';
import Initialize from './lifecycle/initialize';
import Response from './lifecycle/response';
import RuntimeBuild from './lifecycle/runtime';

@injectServices({ initialize: Initialize, runtimeBuild: RuntimeBuild, response: Response })
class HandlerManager extends AbstractManager<{ initialize: Initialize; runtimeBuild: RuntimeBuild; response: Response }> {
  async dialogflow(agent: WebhookClient) {
    const { initialize, runtimeBuild, response } = this.services;
    const conv = agent.conv();

    if (!conv) {
      agent.add('Hello there! Unfortunately, this platform is currently not supported by Voiceflow.');
      return;
    }

    const input = conv.input.raw;

    const { intent } = agent;

    const { parameters: slots } = agent;

    const { userId } = conv.user.storage;

    const runtime = await runtimeBuild.build(_.get(conv.body, 'versionID'), userId);

    if (intent === 'actions.intent.MAIN' || intent === 'Default Welcome Intent' || runtime.stack.isEmpty()) {
      await initialize.build(runtime, conv);
    } else {
      runtime.turn.set(T.REQUEST, {
        type: RequestType.INTENT,
        payload: {
          intent,
          input,
          slots,
        },
      });
    }

    runtime.variables.set(V.TIMESTAMP, Math.floor(Date.now() / 1000));

    await runtime.update();

    await response.build(runtime, agent, conv);
  }
}

export default HandlerManager;
