import { Context, Frame, Store } from '@voiceflow/client';
import { DialogflowConversation } from 'actions-on-google';
import { WebhookClient } from 'dialogflow-fulfillment';
import uuid4 from 'uuid/v4';

import { F, S } from '@/lib/constants';
import { createResumeFrame, RESUME_DIAGRAM_ID } from '@/lib/services/voiceflow/diagrams/resume';

import { SkillMetadata } from '../types';
import { AbstractManager } from '../utils';
import buildContext from './context';
import buildResponse from './response';

const VAR_VF = 'voiceflow';

class LifecycleManager extends AbstractManager {
  async buildContext(versionID: string, userID: string): Promise<Context> {
    return buildContext(this.services, versionID, userID);
  }

  async initialize(context: Context, conv: DialogflowConversation<any>): Promise<void> {
    // fetch the metadata for this version (project)
    const meta = (await context.fetchMetadata()) as SkillMetadata;

    const { stack, storage, variables } = context;

    // TODO: init stream flags

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
      [VAR_VF]: {
        // TODO: implement all exposed voiceflow variables
        events: [],
      },
    });

    // initialize all the global variables
    Store.initialize(variables, meta.global, 0);

    // restart logic
    const shouldRestart = stack.isEmpty() || meta.restart || context.variables.get(VAR_VF)?.resume === false;
    if (shouldRestart) {
      // start the stack with just the root flow
      stack.flush();
      stack.push(new Frame({ diagramID: meta.diagram }));
    } else if (meta.resume_prompt) {
      // resume prompt flow - use command flow logic
      stack.top().storage.set(F.CALLED_COMMAND, true);

      // if there is an existing resume flow, remove itself and anything above it
      const resumeStackIndex = stack.getFrames().findIndex((frame) => frame.getDiagramID() === RESUME_DIAGRAM_ID);
      if (resumeStackIndex >= 0) {
        stack.popTo(resumeStackIndex);
      }

      stack.push(createResumeFrame(meta.resume_prompt));
    } else {
      // give context to where the user left off with last speak block
      stack.top().storage.delete(F.CALLED_COMMAND);
      const lastSpeak = stack.top().storage.get(F.SPEAK) ?? '';

      storage.set(S.OUTPUT, lastSpeak);
    }
  }

  async buildResponse(context: Context, agent: WebhookClient, conv: DialogflowConversation<any>) {
    return buildResponse(this.services, context, agent, conv);
  }
}

export default LifecycleManager;
