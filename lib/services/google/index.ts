import Client, { Context, State, Store } from '@voiceflow/client';
import { DialogflowConversation, SimpleResponse } from 'actions-on-google';
import { WebhookClient as Agent } from 'dialogflow-fulfillment';
import { Request, Response } from 'express';
import randomstring from 'randomstring';

import { S } from '@/lib/constants';

import { AbstractManager } from '../utils';
import { SkillMetadata } from './types';

const buildContext = async (versionID: string, _userID: string, voiceflow: Client): Promise<Context> => {
  const rawState = {};

  return voiceflow.createContext(versionID, rawState as State);
};

const VAR_VF = 'voiceflow';

const initialize = async (context: Context, conv: DialogflowConversation<any>): Promise<void> => {
  // fetch the metadata for this version (project)
  const meta = (await context.fetchMetadata()) as SkillMetadata;

  const { storage, variables } = context;

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
  // storage.set(S.USER, requestEnvelope.context.System.user.userId);

  // set based on metadata
  storage.set(S.ALEXA_PERMISSIONS, meta.alexa_permissions ?? []);
  storage.set(S.REPEAT, meta.repeat ?? 100);

  // default global variables
  variables.merge({
    timestamp: Math.floor(Date.now() / 1000),
    locale: storage.get(S.LOCALE),
    user_id: storage.get(S.USER),
    sessions: storage.get(S.SESSIONS),
    platform: 'google',

    // hidden system variables (code block only)
    [VAR_VF]: {
      // TODO: implement all exposed voiceflow variables
      permissions: storage.get(S.ALEXA_PERMISSIONS),
      events: [],
    },
  });

  // initialize all the global variables
  Store.initialize(variables, meta.global, 0);

  // TODO: restart logic
};

const dialogflowRequestHandler = (voiceflow: Client) => async (agent: Agent) => {
  try {
    const conv = agent.conv();

    if (!conv) {
      agent.add('Hello there! Unfortunately, this platform is currently not supported by Voiceflow.');
      return;
    }

    // const input = conv.input.raw;

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
    const context = await buildContext(/* conv.body.versionID */ 'XwG14yqjQD', userId, voiceflow);

    if (intent === 'actions.intent.MAIN' || intent === 'Default Welcome Intent' || context.stack.isEmpty()) {
      // setUpNewSession(conv, session);
      await initialize(context, conv);
      // session.oneShotIntent = intent;
    }

    // session.raw_input = input;
    // session.intent = intent;
    // session.slots = slots;

    // await responseRender(conv, session);

    conv.close(
      new SimpleResponse({
        speech: '<speak>LEO</speak>',
        text: undefined,
      })
    );
    conv.user.storage.forceUpdateToken = randomstring.generate();
    agent.add(conv);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('INNNER ERR: ', err);
  }
};

class GoogleManager extends AbstractManager {
  handleRequest(request: Request, response: Response) {
    const { WebhookClient, voiceflow } = this.services;

    request.body.versionID = request.params.versionID;

    const agent = new WebhookClient({
      request,
      response,
    });

    const intentMap = new Map();
    intentMap.set(null, dialogflowRequestHandler(voiceflow));

    agent.handleRequest(intentMap);
  }
}

export default GoogleManager;
