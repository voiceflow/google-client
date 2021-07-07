import { ConversationV3 } from '@assistant/conversation';
import _ from 'lodash';

import { Event, RequestType as InteractRequestType } from '@/lib/clients/ingest-client';
import { T, V } from '@/lib/constants';
import { RequestType } from '@/lib/services/runtime/types';

import { AbstractManager, injectServices } from '../../types';
import GoogleManager from '../index';
import Initialize from './lifecycle/initialize';
import Response from './lifecycle/response';
import RuntimeBuild from './lifecycle/runtime';

@injectServices({ initialize: Initialize, runtimeBuild: RuntimeBuild, response: Response })
class HandlerManager extends AbstractManager<{ initialize: Initialize; runtimeBuild: RuntimeBuild; response: Response }> {
  _extractSlots(conv: ConversationV3) {
    const handler = conv.request.handler as { originalName: string };

    if (handler.originalName.startsWith(GoogleManager.SLOT_FILLING_PREFIX)) {
      // slot filling - extract slots from scene
      const rawSlots = conv.scene.slots || {};
      return Object.keys(rawSlots).reduce((acc, key) => {
        acc[key] = rawSlots[key].value;
        return acc;
      }, {} as Record<string, string>);
    }

    // intent matching - extract slots from intent
    const rawSlots = conv.intent.params || {};
    return Object.keys(rawSlots).reduce((acc, key) => {
      acc[key] = rawSlots[key].resolved;
      return acc;
    }, {} as Record<string, string>);
  }

  async handle(conv: ConversationV3) {
    const { initialize, runtimeBuild, response } = this.services;

    const { intent } = conv;
    const input = intent.query;

    const slots = this._extractSlots(conv);

    const { userId } = conv.user.params;

    const runtime = await runtimeBuild.build(_.get(conv.request, 'versionID'), userId);
    const request = {
      type: RequestType.INTENT,
      payload: {
        intent: intent.name,
        input,
        slots,
      },
    };
    if (intent.name === 'actions.intent.MAIN' || intent.name === 'Default Welcome Intent' || runtime.stack.isEmpty()) {
      await initialize.build(runtime, conv);

      runtime.services.analyticsClient.track({
        id: runtime.getVersionID(),
        event: Event.INTERACT,
        request: InteractRequestType.LAUNCH,
        payload: request,
        sessionid: conv.session.id,
        metadata: runtime.getRawState(),
      });
    } else {
      request.type = intent.name?.startsWith('actions.intent.MEDIA_STATUS') ? RequestType.MEDIA_STATUS : RequestType.INTENT;
      request.payload.intent = intent.name;

      runtime.turn.set(T.REQUEST, request);
      runtime.services.analyticsClient.track({
        id: runtime.getVersionID(),
        event: Event.INTERACT,
        request: InteractRequestType.REQUEST,
        payload: request,
        sessionid: conv.session.id,
        metadata: runtime.getRawState(),
      });
    }

    runtime.variables.set(V.TIMESTAMP, Math.floor(Date.now() / 1000));
    await runtime.update();

    await response.build(runtime, conv);
  }
}

export default HandlerManager;
