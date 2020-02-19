import { Context, Store } from '@voiceflow/client';
import { DialogflowConversation } from 'actions-on-google';

import { S } from '@/lib/constants';

import { SkillMetadata } from '../../types';

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

export default initialize;
