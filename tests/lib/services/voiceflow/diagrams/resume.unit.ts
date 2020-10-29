import { expect } from 'chai';

import { createResumeFrame, promptToSSML, RESUME_DIAGRAM_ID, ResumeVariables } from '@/lib/services/voiceflow/programs/resume';

describe('resume diagram', () => {
  describe('promptToSSML', () => {
    it('audio', () => {
      const content = 'random content';

      expect(promptToSSML(content, 'audio')).to.eql(`<audio src="${content}"/>`);
    });

    it('not audio', () => {
      const content = 'random content';
      const voice = 'not audio';

      expect(promptToSSML(content, voice)).to.eql(content);
    });

    it('empty content', () => {
      expect(promptToSSML(undefined, '')).to.eql('');
    });
  });

  describe('createResumeFrame', () => {
    it('correct id and variables', () => {
      const resumePrompt = {
        content: 'content',
        voice: 'not audio',
      };
      const followPrompt = {
        content: 'follow content',
        voice: 'not followaudio',
      };

      const frame = createResumeFrame(resumePrompt as any, followPrompt as any);

      expect(frame.getProgramID()).to.eql(RESUME_DIAGRAM_ID);
      expect(frame.variables.get(ResumeVariables.CONTENT)).to.eql(resumePrompt.content);
      expect(frame.variables.get(ResumeVariables.FOLLOW_CONTENT)).to.eql(followPrompt.content);
    });

    it('no follow prompt', () => {
      const resumePrompt = {
        content: 'content',
        voice: 'not audio',
      };

      const frame = createResumeFrame(resumePrompt as any, null);

      expect(frame.getProgramID()).to.eql(RESUME_DIAGRAM_ID);
      expect(frame.variables.get(ResumeVariables.CONTENT)).to.eql(resumePrompt.content);
      expect(frame.variables.get(ResumeVariables.FOLLOW_CONTENT)).to.eql('');
    });
  });
});
