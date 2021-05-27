import { expect } from 'chai';
import sinon from 'sinon';

import Dialogflow from '@/lib/controllers/dialogflow';

describe('dialogflow controller unit tests', () => {
  beforeEach(() => sinon.restore());

  describe('es', () => {
    it('works correctly', async () => {
      const output = { foo: 'bar' };
      const services = {
        dialogflow: {
          es: sinon.stub().resolves(output),
        },
      };
      const dialogflow = new Dialogflow(services as any, null as any);

      const req = { body: { foo: 'bar' }, params: { versionID: 'version-id' } };

      expect(await dialogflow.es(req as any)).to.eql(output);
      expect(services.dialogflow.es.args).to.eql([[req.body, req.params.versionID]]);
    });
  });
});
