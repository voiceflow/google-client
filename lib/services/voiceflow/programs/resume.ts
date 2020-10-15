import { Frame, Program } from '@voiceflow/client';
import { NodeType, Prompt } from '@voiceflow/general-types';
import { Voice } from '@voiceflow/google-types';

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

export const promptToSSML = (content = '', voice: string | undefined) => {
  if (voice === 'audio') {
    return `<audio src="${content}"/>`;
  }

  return content;
};

export const createResumeFrame = (resume: Prompt<Voice>, follow: Prompt<Voice> | null) => {
  return new Frame({
    programID: RESUME_DIAGRAM_ID,
    variables: {
      [ResumeVariables.CONTENT]: promptToSSML(resume.content, resume.voice),
      [ResumeVariables.FOLLOW_CONTENT]: follow ? promptToSSML(follow.content, follow.voice) : '',
    },
  });
};

const ResumeDiagramRaw = {
  id: RESUME_DIAGRAM_ID,
  lines: {
    1: {
      id: '1',
      type: NodeType.SPEAK,
      speak: `{${ResumeVariables.CONTENT}}`,
      nextId: '2',
    },
    2: {
      id: '2',
      type: 'choice',
      choices: [{ open: true }, { open: true }],
      inputs: [
        // todo: support other languages
        ['yes', 'yea', 'ok', 'okay', 'yup', 'ya', 'sure'],
        ['no', 'nope', 'nay', 'nah', 'no way', 'negative'],
      ],
      nextIds: ['3', '4'],
      elseId: '3',
    },
    3: {
      id: '3',
      type: NodeType.SPEAK,
      speak: `{${ResumeVariables.FOLLOW_CONTENT}}`,
    },
    4: {
      id: '4',
      type: 'reset',
      reset: true,
    },
  },
  startId: '1',
};

export const ResumeDiagram = new Program(ResumeDiagramRaw);
