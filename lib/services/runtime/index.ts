import Client, { DataAPI, EventType } from '@voiceflow/general-runtime/build/runtime';
import { GoogleProgram, GoogleVersion } from '@voiceflow/google-types';

import { F, S } from '@/lib/constants';
import { Config } from '@/types';

import { FullServiceMap as Services } from '../index';
import HandlersMap from './handlers';
import { RESUME_DIAGRAM_ID, ResumeDiagram } from './programs/resume';
import { GoogleRuntimeClient } from './types';

const utilsObj = {
  Client,
  resume: {
    ResumeDiagram,
    RESUME_DIAGRAM_ID,
  },
  HandlersMap,
};

type Version = keyof typeof HandlersMap;

const RuntimeClientManager = (services: Services, config: Config, v: Version = 'v1', utils = utilsObj): GoogleRuntimeClient => {
  const handlers = utils.HandlersMap[v](config);

  const client = new utils.Client<unknown, DataAPI<GoogleProgram, GoogleVersion>>({
    api: services.dataAPI,
    services,
    handlers,
  });

  client.setEvent(EventType.frameDidFinish, ({ runtime }) => {
    if (runtime.stack.top()?.storage.get(F.CALLED_COMMAND)) {
      runtime.stack.top().storage.delete(F.CALLED_COMMAND);

      const output = runtime.stack.top().storage.get(F.SPEAK);

      if (output) {
        runtime.storage.produce((draft) => {
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

  return client;
};

export default RuntimeClientManager;
