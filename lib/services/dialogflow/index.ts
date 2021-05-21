import { T, V } from '@/lib/constants';
import { RequestType } from '@/lib/services/runtime/types';

import { AbstractManager, injectServices } from '../types';
import Initialize from './lifecycle/initialize';
import Response from './lifecycle/response';
import RuntimeBuild from './lifecycle/runtime';
import { WebhookRequest } from './types';

@injectServices({ initialize: Initialize, runtimeBuild: RuntimeBuild, response: Response })
class DialogflowManager extends AbstractManager<{ initialize: Initialize; runtimeBuild: RuntimeBuild; response: Response }> {
  async es(req: WebhookRequest, versionID: string) {
    const { metrics, initialize, runtimeBuild, response } = this.services;

    metrics.invocation();

    const intentName = req.queryResult.intent.displayName;
    const input = req.queryResult.queryText;
    const slots = req.queryResult.parameters;
    const userId = req.session;

    const runtime = await runtimeBuild.build(versionID, userId);

    if (intentName === 'actions.intent.MAIN' || intentName === 'Default Welcome Intent' || runtime.stack.isEmpty()) {
      await initialize.build(runtime, req);
    } else {
      let type;
      if (intentName?.startsWith('actions.intent.MEDIA_STATUS')) {
        type = RequestType.MEDIA_STATUS;
      } else {
        type = RequestType.INTENT;
      }

      runtime.turn.set(T.REQUEST, {
        type,
        payload: {
          intent: intentName,
          input,
          slots,
        },
      });
    }

    runtime.variables.set(V.TIMESTAMP, Math.floor(Date.now() / 1000));
    await runtime.update();

    return response.build(runtime);
  }
}

export default DialogflowManager;
