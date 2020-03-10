import Client, { EventType } from '@voiceflow/client';

import { F, S } from '@/lib/constants';

import { AbstractManager, injectServices } from '../types';
import { RESUME_DIAGRAM_ID, ResumeDiagram } from './diagrams/resume';
import handlers from './handlers';

const utils = {
  Client,
  resume: {
    ResumeDiagram,
    RESUME_DIAGRAM_ID,
  },
};
@injectServices({ utils })
class VoiceflowManager extends AbstractManager<{ utils: typeof utils }> {
  client(): Client {
    const client = new this.services.utils.Client({
      secret: this.services.secretsProvider.get('VF_DATA_SECRET'),
      endpoint: this.config.VF_DATA_ENDPOINT,
      handlers,
    });

    client.setEvent(EventType.frameDidFinish, ({ context }) => {
      if (context.stack.top()?.storage.get(F.CALLED_COMMAND)) {
        context.stack.top().storage.delete(F.CALLED_COMMAND);

        const output = context.stack.top().storage.get(F.SPEAK);
        if (output) {
          context.storage.produce((draft) => {
            draft[S.OUTPUT] += output;
          });
        }
      }
    });

    client.setEvent(EventType.diagramWillFetch, ({ diagramID, override }) => {
      if (diagramID === this.services.utils.resume.RESUME_DIAGRAM_ID) {
        override(this.services.utils.resume.ResumeDiagram);
      }
    });

    return client;
  }
}

export default VoiceflowManager;
