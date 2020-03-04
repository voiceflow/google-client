import { Context } from '@voiceflow/client';
import { DialogflowConversation, SimpleResponse } from 'actions-on-google';
import { WebhookClient } from 'dialogflow-fulfillment';
import randomstring from 'randomstring';

import { S, T } from '@/lib/constants';
import { responseHandlers } from '@/lib/services/voiceflow/handlers';

import { FullServiceMap } from '..';

const build = async (services: FullServiceMap, context: Context, agent: WebhookClient, conv: DialogflowConversation<any>) => {
  const { state } = services;
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

  // eslint-disable-next-line no-restricted-syntax
  for (const handler of responseHandlers) {
    // eslint-disable-next-line no-await-in-loop
    await handler(context, conv);
  }

  state.saveToDb(storage.get(S.USER), context.getFinalState());

  conv.user.storage.forceUpdateToken = randomstring.generate();
  agent.add(conv);
};

export default build;
