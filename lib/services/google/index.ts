import Client, { Context, Frame, State, Store } from '@voiceflow/client';
import { DialogflowConversation, SimpleResponse } from 'actions-on-google';
import { WebhookClient as Agent } from 'dialogflow-fulfillment';
import { Request, Response } from 'express';
import randomstring from 'randomstring';
import uuid4 from 'uuid/v4';

import { S, T } from '@/lib/constants';

// import { responseHandlers } from '@/lib/services/voiceflow/handlers';
import { AbstractManager } from '../utils';
import { SkillMetadata } from './types';

// TODO: actually read from dynamo
const buildContext = async (versionID: string, _userID: string, voiceflow: Client): Promise<Context> => {
  const rawState = {};

  const context = voiceflow.createContext(versionID, rawState as State);
  context.storage.set(S.OUTPUT, '');

  return context;
};

const initialize = async (context: Context, conv: DialogflowConversation<any>): Promise<void> => {
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
};

const buildResponse = async (context: Context, conv: DialogflowConversation<any>, agent: Agent) => {
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

  // TODO: persist context

  conv.user.storage.forceUpdateToken = randomstring.generate();
  agent.add(conv);
};

const dialogflowRequestHandler = (voiceflow: Client) => async (agent: Agent) => {
  try {
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
    const context = await buildContext('XwG14yqjQD', userId, voiceflow);

    if (intent === 'actions.intent.MAIN' || intent === 'Default Welcome Intent' || context.stack.isEmpty()) {
      await initialize(context, conv);
    }

    // TODO
    // session.raw_input = input;
    // session.intent = intent;
    // session.slots = slots;

    await context.update();

    buildResponse(context, conv, agent);
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
