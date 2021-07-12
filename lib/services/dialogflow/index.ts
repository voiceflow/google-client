import { Event, RequestType as InteractRequestType } from '@/lib/clients/ingest-client';
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
    const request = {
      type: RequestType.INTENT,
      payload: {
        intent: intentName,
        input,
        slots,
      },
    };
    const mainIntent1 = 'actions.intent.MAIN';
    const mainIntent2 = 'Default Welcome Intent';
    if (intentName === mainIntent1 || intentName === mainIntent2 || runtime.stack.isEmpty()) {
      await initializeES.build(runtime, req);
      if (intentName === mainIntent1 || intentName === mainIntent2) {
        runtime.services.analyticsClient.track({
          id: runtime.getVersionID(),
          event: Event.INTERACT,
          request: InteractRequestType.LAUNCH,
          payload: request,
          sessionid: req.session,
          metadata: runtime.getRawState(),
        });
      }
    }

    if (!['actions.intent.MAIN', 'Default Welcome Intent'].includes(intentName)) {
      runtime.turn.set(T.REQUEST, request);
      runtime.services.analyticsClient.track({
        id: runtime.getVersionID(),
        event: Event.INTERACT,
        request: InteractRequestType.REQUEST,
        payload: request,
        sessionid: req.session,
        metadata: runtime.getRawState(),
      });
    }

    runtime.variables.set(V.TIMESTAMP, Math.floor(Date.now() / 1000));
    runtime.variables.set(V.DF_ES_CHANNEL, this._getChannel(req));
    await runtime.update();

    return responseES.build(runtime);
  }

  /*
    From the docs, the channel is found in the source field of the originalDetectIntentRequest object
    https://cloud.google.com/dialogflow/es/docs/reference/rpc/google.cloud.dialogflow.v2#originaldetectintentrequest
    For some channels like "webdemo" or "dfMessenger" the field is emtpy, but we can infer it from the session id
    (i.e, this is what a session id looks like from dfMessenger: 
      projects/english-project-69249/agent/sessions/dfMessenger-32453617/contexts/system_counters)
  */
  _getChannel(req: WebhookRequest) {
    if (req.originalDetectIntentRequest.source) return req.originalDetectIntentRequest.source;

    const specialChannels = ['webdemo', 'dfMessenger'];

    const channel = specialChannels.find((ch) => req.session.includes(ch));

    return channel ?? 'unknown';
  }
}

export default DialogflowManager;
