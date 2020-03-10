// import { expect } from 'chai';
import sinon from 'sinon';

import VoiceflowManager from '@/lib/services/voiceflow';

describe('voiceflowManager unit tests', async () => {
  afterEach(() => sinon.restore());

  describe('client', () => {
    it('works correctly', async () => {
      const services = {
        utils: {
          resume: {
            ResumeDiagram: { foo: 'bar' },
            RESUME_DIAGRAM_ID: 'diagram-id',
          },
          Client: sinon.stub().returns({
            setEvent: sinon.stub(),
          }),
        },
        secretsProvider: {
          get: sinon.stub().returns('random-secret'),
        },
      };
      const config = {
        VF_DATA_ENDPOINT: 'random-endpoint',
      };
      const voiceflowManager = new VoiceflowManager(services as any, config as any);

      voiceflowManager.client();

      // todo: assertions
    });
  });
});
