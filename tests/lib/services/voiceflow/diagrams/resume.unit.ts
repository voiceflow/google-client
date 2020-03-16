import { expect } from 'chai';

import { createResumeFrame, promptToSSML, RESUME_DIAGRAM_ID, ResumeVariables } from '@/lib/services/voiceflow/diagrams/resume';

describe('resume diagram', () => {
  describe('promptToSSML', () => {
    it('audio', () => {
      const content = 'random content';

      expect(promptToSSML(content, 'audio')).to.eql(`<audio src="${content}"/>`);
    });

    it('not audio', () => {
      const content = 'random content';

      expect(promptToSSML(content, 'not audio')).to.eql(content);
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
        follow_content: 'follow content',
        follow_voice: 'not audio',
      };

      const frame = createResumeFrame(resumePrompt);

      expect(frame.getDiagramID()).to.eql(RESUME_DIAGRAM_ID);
      expect(frame.variables.get(ResumeVariables.CONTENT)).to.eql(resumePrompt.content);
      expect(frame.variables.get(ResumeVariables.FOLLOW_CONTENT)).to.eql(resumePrompt.follow_content);
    });
  });
});
