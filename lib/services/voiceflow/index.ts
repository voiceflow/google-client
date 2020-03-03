import Client, { EventType } from '@voiceflow/client';

import { F, S } from '@/lib/constants';
import { Config } from '@/types';

import { ServiceMap } from '..';
import { RESUME_DIAGRAM_ID, ResumeDiagram } from './diagrams/resume';
import handlers from './handlers';

const Voiceflow = (_services: ServiceMap, config: Config) => {
  const client = new Client({
    secret: config.VF_DATA_SECRET,
    endpoint: config.VF_DATA_ENDPOINT,
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
    if (diagramID === RESUME_DIAGRAM_ID) {
      override(ResumeDiagram);
    }
  });

  return client;
};

export default Voiceflow;
