import { expect } from 'chai';
import sinon from 'sinon';

import GoogleManager from '@/lib/services/google';

describe('googleManager unit tests', async () => {
  afterEach(() => sinon.restore());

  describe('handleRequest', () => {
    it('works correctly', async () => {
      const handleRequest = sinon.stub();
      const dialogflowHandler = sinon.stub().returns('dialogflowHandler');
      const services = { WebhookClient: sinon.stub().returns({ handleRequest }), handler: { dialogflow: dialogflowHandler } };
      const googleManager = new GoogleManager(services as any, null as any);

      const req = { params: { versionID: 'random-id' }, body: { versionID: null } };
      const res = {};

      await googleManager.handleRequest(req as any, res as any);

      expect(req.body.versionID).to.eql(req.params.versionID);
      expect(services.WebhookClient.args[0]).to.eql([{ request: req, response: res }]);
      expect(handleRequest.args[0][0].get(null)()).to.eql('dialogflowHandler');
    });
  });
});
