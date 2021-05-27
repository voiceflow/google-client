import { T, V } from '@/lib/constants';
import { RequestType } from '@/lib/services/runtime/types';

import { AbstractManager, injectServices } from '../types';
import InitializeES from './lifecycle/es/initialize';
import ResponseES from './lifecycle/es/response';
import RuntimeBuildES from './lifecycle/es/runtime';
import { WebhookRequest } from './types';

@injectServices({ initializeES: InitializeES, runtimeBuildES: RuntimeBuildES, responseES: ResponseES })
class DialogflowManager extends AbstractManager<{ initializeES: InitializeES; runtimeBuildES: RuntimeBuildES; responseES: ResponseES }> {
  async es(req: WebhookRequest, versionID: string) {
    const { metrics, initializeES, runtimeBuildES, responseES } = this.services;

    metrics.invocation();

    const intentName = req.queryResult.intent.displayName;
    const input = req.queryResult.queryText;
    const slots = req.queryResult.parameters;
    const userId = req.session;

    const runtime = await runtimeBuildES.build(versionID, userId);

    if (intentName === 'actions.intent.MAIN' || intentName === 'Default Welcome Intent' || runtime.stack.isEmpty()) {
      await initializeES.build(runtime, req);
    }

    if (!['actions.intent.MAIN', 'Default Welcome Intent'].includes(intentName)) {
      runtime.turn.set(T.REQUEST, {
        type: RequestType.INTENT,
        payload: {
          intent: intentName,
          input,
          slots,
        },
      });
    }

    runtime.variables.set(V.TIMESTAMP, Math.floor(Date.now() / 1000));
    await runtime.update();

    return responseES.build(runtime);
  }
}

export default DialogflowManager;
