import { expect } from 'chai';
import _ from 'lodash';
import sinon from 'sinon';

import GoogleManager from '@/lib/services/googleV2';

describe('googleV2Manager unit tests', async () => {
  afterEach(() => sinon.restore());

  describe('handleRequest', () => {
    it('works correctly', async () => {
      const handleRequest = sinon.stub();
      const actionsHandle = sinon.stub().returns('output');
      const googleApp: any = sinon.stub();
      googleApp.handle = handleRequest;

      const services = {
        metrics: { invocation: sinon.stub() },
        GoogleConversation: sinon.stub().returns(googleApp),
        handler: { handle: actionsHandle },
      };
      const googleManager = new GoogleManager(services as any, null as any);

      const req = { params: { versionID: 'random-id' }, body: { versionID: null, handler: { name: 'not_main' } } };
      const res = {};

      await googleManager.handleRequest(req as any, res as any);

      // handler name
      expect(req.body.handler.name).to.eql('main');
      expect(_.get(req.body.handler, 'originalName')).to.eql('not_main');

      expect(req.body.versionID).to.eql(req.params.versionID);
      expect(services.GoogleConversation.callCount).to.eql(1);
      expect(googleApp.args[0]).to.eql([req, res]);
      expect(googleApp.handle.args[0][0]).to.eql('main');
      expect(googleApp.handle.args[0][1]()).to.eql('output');
      expect(services.metrics.invocation.callCount).to.eql(1);
    });

    it('slot filling', async () => {
      const handleRequest = sinon.stub();
      const actionsHandle = sinon.stub().returns('output');
      const googleApp: any = sinon.stub();
      googleApp.handle = handleRequest;

      const services = {
        metrics: { invocation: sinon.stub() },
        GoogleConversation: sinon.stub().returns(googleApp),
        handler: { handle: actionsHandle },
      };
      const googleManager = new GoogleManager(services as any, null as any);

      const req = {
        params: { versionID: 'random-id' },
        body: { versionID: null, handler: { name: 'slot_filling_travel_intent' }, intent: { name: '' } },
      };
      const res = {};

      await googleManager.handleRequest(req as any, res as any);

      // slot filling
      expect(req.body.intent.name).to.eql('travel_intent');
    });
  });
});
