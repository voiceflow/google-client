import Client, { Context, Frame, State, Store } from '@voiceflow/client';
import { DialogflowConversation, SimpleResponse } from 'actions-on-google';
import { WebhookClient as Agent } from 'dialogflow-fulfillment';
import { Request, Response } from 'express';
import randomstring from 'randomstring';
import uuid4 from 'uuid/v4';

import { S, T } from '@/lib/constants';
import { Config } from '@/types';

// import { responseHandlers } from '@/lib/services/voiceflow/handlers';
import { AbstractManager } from '../utils';
import { SkillMetadata } from './types';

const GACTION_SESSIONS_DYNAMO_PREFIX = 'gactions.user';

const persistState = async (docClient: AWS.DynamoDB.DocumentClient, config: Config, userId: string, state: State) => {
  const params = {
    TableName: config.SESSIONS_DYNAMO_TABLE,
    Item: {
      id: `${GACTION_SESSIONS_DYNAMO_PREFIX}.${userId}`,
      state,
    },
  };

  try {
    await docClient.put(params).promise();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('persist state error:', e);
  }
};

const getStateFromDb = async (docClient: AWS.DynamoDB.DocumentClient, config: Config, userId: string) => {
  if (!userId) {
    return {};
  }

  const params = {
    TableName: config.SESSIONS_DYNAMO_TABLE,
    Key: {
      id: `${GACTION_SESSIONS_DYNAMO_PREFIX}.${userId}`,
    },
  };

  try {
    const data = await docClient.get(params).promise();

    if (!data.Item) {
      throw new Error(`session not found for userId: ${userId}`);
    }

    return data.Item.state;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('get state from db err:', err);
    return {};
  }
};

// TODO: actually read from dynamo
const buildContext = async (
  versionID: string,
  userID: string,
  voiceflow: Client,
  docClient: AWS.DynamoDB.DocumentClient,
  config: Config
): Promise<Context> => {
  const rawState = await getStateFromDb(docClient, config, userID);

  const context = voiceflow.createContext(versionID, rawState as State);

  context.turn.set(T.PREVIOUS_OUTPUT, context.storage.get(S.OUTPUT));
  context.storage.set(S.OUTPUT, '');

  // TODO: set events 'frameDidFinish' and 'diagramWillFetch'

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

const buildResponse = async (
  context: Context,
  conv: DialogflowConversation<any>,
  agent: Agent,
  docClient: AWS.DynamoDB.DocumentClient,
  config: Config
) => {
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

  persistState(docClient, config, storage.get(S.USER), context.getFinalState());

  conv.user.storage.forceUpdateToken = randomstring.generate();
  agent.add(conv);
};

const dialogflowRequestHandler = (voiceflow: Client, docClient: AWS.DynamoDB.DocumentClient, config: Config) => async (agent: Agent) => {
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
    const context = await buildContext('XwG14yqjQD', userId, voiceflow, docClient, config);

    if (intent === 'actions.intent.MAIN' || intent === 'Default Welcome Intent' || context.stack.isEmpty()) {
      await initialize(context, conv);
    }

    // TODO
    // session.raw_input = input;
    // session.intent = intent;
    // session.slots = slots;

    await context.update();

    buildResponse(context, conv, agent, docClient, config);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('INNNER ERR: ', err);
  }
};

class GoogleManager extends AbstractManager {
  handleRequest(request: Request, response: Response) {
    const { WebhookClient, voiceflow, docClient } = this.services;

    request.body.versionID = request.params.versionID;

    const agent = new WebhookClient({
      request,
      response,
    });

    const intentMap = new Map();
    intentMap.set(null, dialogflowRequestHandler(voiceflow, docClient, this.config as Config));

    agent.handleRequest(intentMap);
  }
}

export default GoogleManager;
