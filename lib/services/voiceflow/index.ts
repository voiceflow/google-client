import Client, { EventType } from '@voiceflow/client';

import { F, S } from '@/lib/constants';

import { AbstractManager, injectServices } from '../types';
import { RESUME_DIAGRAM_ID, ResumeDiagram } from './diagrams/resume';
import handlers from './handlers';

const utilsObj = {
  Client,
  resume: {
    ResumeDiagram,
    RESUME_DIAGRAM_ID,
  },
  handlers,
};
@injectServices({ utils: utilsObj })
class VoiceflowManager extends AbstractManager<{ utils: typeof utilsObj }> {
  client(): Client {
    const { utils } = this.services;

    const client = new utils.Client({
      secret: this.services.secretsProvider.get('VF_DATA_SECRET'),
      endpoint: this.config.VF_DATA_ENDPOINT,
      handlers: utils.handlers,
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
      if (diagramID === utils.resume.RESUME_DIAGRAM_ID) {
        override(utils.resume.ResumeDiagram);
      }
    });

    return client;
  }
}

export default VoiceflowManager;
