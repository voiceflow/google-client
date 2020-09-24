import { ConversationV3 } from '@assistant/conversation';
import _ from 'lodash';

import { T, V } from '@/lib/constants';
import { RequestType } from '@/lib/services/voiceflow/types';

import { AbstractManager, injectServices } from '../../types';
import GoogleManager from '../index';
import Context from './lifecycle/context';
import Initialize from './lifecycle/initialize';
import Response from './lifecycle/response';

@injectServices({ initialize: Initialize, context: Context, response: Response })
class HandlerManager extends AbstractManager<{ initialize: Initialize; context: Context; response: Response }> {
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
    const { initialize, context, response } = this.services;

    const { intent } = conv;
    const input = intent.query;

    const slots = this._extractSlots(conv);

    const { userId } = conv.user.params;

    const newContext = await context.build(_.get(conv.request, 'versionID'), userId);

    if (intent.name === 'actions.intent.MAIN' || intent.name === 'Default Welcome Intent' || newContext.stack.isEmpty()) {
      await initialize.build(newContext, conv);
    } else {
      newContext.turn.set(T.REQUEST, {
        type: RequestType.INTENT,
        payload: {
          intent: intent.name,
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
