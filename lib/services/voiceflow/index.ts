import { GoogleProgram, GoogleVersion } from '@voiceflow/google-types';
import Client, { DataAPI, EventType } from '@voiceflow/runtime';

import { F, S } from '@/lib/constants';
import { Config } from '@/types';

import { FullServiceMap as Services } from '../index';
import HandlersMap from './handlers';
import { RESUME_DIAGRAM_ID, ResumeDiagram } from './programs/resume';

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

  const client = new utils.Client<DataAPI<GoogleProgram, GoogleVersion>>({
    api: services.dataAPI,
    services,
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

  client.setEvent(EventType.programWillFetch, ({ programID, override }) => {
    if (programID === utils.resume.RESUME_DIAGRAM_ID) {
      override(utils.resume.ResumeDiagram);
    }
  });

  return { client };
};

export default VoiceflowManager;
