import { Context, Frame, Store } from '@voiceflow/client';
import { DialogflowConversation } from 'actions-on-google';

import { F, S } from '@/lib/constants';
import { createResumeFrame, RESUME_DIAGRAM_ID } from '@/lib/services/voiceflow/diagrams/resume';

import { AbstractManager, injectServices, SkillMetadata } from '../../../types';

const utils = {
  resume: {
    createResumeFrame,
    RESUME_DIAGRAM_ID,
  },
  client: {
    Frame,
    Store,
  },
};

@injectServices({ utils })
class InitializeManager extends AbstractManager<{ utils: typeof utils }> {
  static VAR_VF = 'voiceflow';

  async build(context: Context, conv: DialogflowConversation<any>): Promise<void> {
    const { resume, client } = this.services.utils;

    // fetch the metadata for this version (project)
    const meta = (await context.fetchMetadata()) as SkillMetadata;

    const { stack, storage, variables } = context;

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
    if (!conv.user.storage.userId) conv.user.storage.userId = this.services.uuid4();
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
      [InitializeManager.VAR_VF]: {
        // TODO: implement all exposed voiceflow variables
        events: [],
      },
    });

    // initialize all the global variables
    client.Store.initialize(variables, meta.global, 0);

    // restart logic
    const shouldRestart = stack.isEmpty() || meta.restart || variables.get(InitializeManager.VAR_VF)?.resume === false;
    if (shouldRestart) {
      // start the stack with just the root flow
      stack.flush();
      stack.push(new client.Frame({ diagramID: meta.diagram }));
    } else if (meta.resume_prompt) {
      // resume prompt flow - use command flow logic
      stack.top().storage.set(F.CALLED_COMMAND, true);

      // if there is an existing resume flow, remove itself and anything above it
      const resumeStackIndex = stack.getFrames().findIndex((frame) => frame.getDiagramID() === resume.RESUME_DIAGRAM_ID);
      if (resumeStackIndex >= 0) {
        stack.popTo(resumeStackIndex);
      }

      stack.push(resume.createResumeFrame(meta.resume_prompt));
    } else {
      // give context to where the user left off with last speak block
      stack.top().storage.delete(F.CALLED_COMMAND);
      const lastSpeak = stack.top().storage.get(F.SPEAK) ?? '';

      storage.set(S.OUTPUT, lastSpeak);
    }
  }
}

export default InitializeManager;
