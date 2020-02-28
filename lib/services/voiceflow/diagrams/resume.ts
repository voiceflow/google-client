import { Diagram, Frame } from '@voiceflow/client';

import { IntentName } from '@/lib/services/voiceflow/types';

export const RESUME_DIAGRAM_ID = '__RESUME_FLOW__';

export enum ResumeVariables {
  CONTENT = '__content0__',
  VOICE = '__voice0__',
  FOLLOW_CONTENT = '__content1__',
  FOLLOW_VOICE = '__voice1__',
}

export type ResumePrompt = {
  content: string;
  voice: string;
  follow_content: string;
  follow_voice: string;
};

const promptToSSML = (content = '', voice: string | undefined) => {
  if (voice === 'audio') {
    return `<audio src="${content}"/>`;
  }

  return content;
};

export const createResumeFrame = (resumePrompt: ResumePrompt) => {
  return new Frame({
    diagramID: RESUME_DIAGRAM_ID,
    variables: {
      [ResumeVariables.CONTENT]: promptToSSML(resumePrompt.content, resumePrompt.voice),
      [ResumeVariables.FOLLOW_CONTENT]: promptToSSML(resumePrompt.follow_content, resumePrompt.follow_voice),
    },
  });
};

const ResumeDiagramRaw = {
  id: RESUME_DIAGRAM_ID,
  blocks: {
    1: {
      blockID: '1',
      speak: `{${ResumeVariables.CONTENT}}`,
      nextId: '2',
    },
    2: {
      blockID: '2',
      interactions: [
        {
          intent: IntentName.YES,
          mappings: [],
        },
        {
          intent: IntentName.NO,
          mappings: [],
        },
      ],
      nextIds: ['3', '4'],
      elseId: '3',
    },
    3: {
      blockID: '3',
      speak: `{${ResumeVariables.FOLLOW_CONTENT}}`,
    },
    4: {
      blockID: '4',
      reset: true,
    },
  },
  startBlockID: '1',
};

export const ResumeDiagram = new Diagram(ResumeDiagramRaw);
