import { Context, Frame, State, Store } from '@voiceflow/client';
import { DialogflowConversation, SimpleResponse } from 'actions-on-google';
import { WebhookClient } from 'dialogflow-fulfillment';
import randomstring from 'randomstring';
import uuid4 from 'uuid/v4';

// import { responseHandlers } from '@/lib/services/voiceflow/handlers';
import { S, T } from '@/lib/constants';

import { SkillMetadata } from './types';
import { AbstractManager } from './utils';

class LifecycleManager extends AbstractManager {
  async buildContext(versionID: string, userID: string): Promise<Context> {
    const { state, voiceflow } = this.services;

    const rawState = await state.getFromDb(userID);

    const context = voiceflow.createContext(versionID, rawState as State);

    context.turn.set(T.PREVIOUS_OUTPUT, context.storage.get(S.OUTPUT));
    context.storage.set(S.OUTPUT, '');

    // TODO: set events 'frameDidFinish' and 'diagramWillFetch'

    return context;
  }

  async initialize(context: Context, conv: DialogflowConversation<any>): Promise<void> {
    // fetch the metadata for this version (project)
    const meta = (await context.fetchMetadata()) as SkillMetadata;

    const { stack, storage, variables } = context;

    // TODO: stream flags

    // increment user sessions by 1 or initialize
    if (!storage.get(S.SESSIONS)) {
      storage.set(S.SESSIONS, 1);
    } else {
      storage.produce((draft) => {
        draft[S.SESSIONS] += 1;
      });
    }

    // set based on input
    storage.set(S.LOCALE, conv.user?.locale);
    if (!conv.user.storage.userId) conv.user.storage.userId = uuid4();
    storage.set(S.USER, conv.user.storage.userId);

    // set based on metadata
    storage.set(S.REPEAT, meta.repeat ?? 100);

    // default global variables
    variables.merge({
      timestamp: Math.floor(Date.now() / 1000),
      locale: storage.get(S.LOCALE),
      user_id: storage.get(S.USER),
      sessions: storage.get(S.SESSIONS),
      platform: 'google',

      // hidden system variables (code block only)
      voiceflow: {
        // TODO: implement all exposed voiceflow variables
        events: [],
      },
    });

    // initialize all the global variables
    Store.initialize(variables, meta.global, 0);

    // TODO: restart logic
    stack.push(new Frame({ diagramID: meta.diagram }));
  }

  async buildResponse(context: Context, agent: WebhookClient) {
    const { state } = this.services;
    const conv = agent.conv();
    const { storage, turn } = context;

    if (context.stack.isEmpty()) {
      turn.set(T.END, true);
    }

    let displayText;

    if (
      storage
        .get(S.OUTPUT)
        .replace(/<[^><]+\/?>/g, '')
        .trim().length === 0
    ) {
      displayText = '🔊';
    }

    const response = new SimpleResponse({
      speech: `<speak>${storage.get(S.OUTPUT)}</speak>`,
      text: displayText,
    });

    if (turn.get(T.END)) {
      conv.close(response);
    } else {
      conv.ask(response);
    }

    // TODO: add response builders for card, play and chips
    // eslint-disable-next-line no-restricted-syntax
    // for (const handler of responseHandlers) {
    //   // eslint-disable-next-line no-await-in-loop
    //   await handler(context, conv);
    // }

    state.saveToDb(storage.get(S.USER), context.getFinalState());

    conv.user.storage.forceUpdateToken = randomstring.generate();
    agent.add(conv);
  }
}

export default LifecycleManager;
