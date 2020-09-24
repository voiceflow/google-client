import Client, { EventType } from '@voiceflow/client';

import { F, S } from '@/lib/constants';
import { Config } from '@/types';

import { FullServiceMap as Services } from '../index';
import { RESUME_DIAGRAM_ID, ResumeDiagram } from './diagrams/resume';
import HandlersMap from './handlers';

const utilsObj = {
  Client,
  resume: {
    ResumeDiagram,
    RESUME_DIAGRAM_ID,
  },
  HandlersMap,
};

type Version = keyof typeof HandlersMap;

const VoiceflowManager = (services: Services, config: Config, v: Version = 'v1', utils = utilsObj) => {
  const handlers = utils.HandlersMap[v](config);

  const client = new utils.Client({
    secret: services.secretsProvider.get('VF_DATA_SECRET'),
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
    if (diagramID === utils.resume.RESUME_DIAGRAM_ID) {
      override(utils.resume.ResumeDiagram);
    }
  });

  return { client };
};

export default VoiceflowManager;
