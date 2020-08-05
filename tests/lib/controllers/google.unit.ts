import { expect } from 'chai';
import sinon from 'sinon';

import Google from '@/lib/controllers/google';

describe('google controller unit tests', () => {
  beforeEach(() => sinon.restore());

  describe('handler', () => {
    it('works correctly', async () => {
      const services = {
        google: {
          handleRequest: sinon.stub().resolves(),
        },
      };
      const google = new Google(services as any, null as any);

      const req = { foo: 'bar' };
      const res = { foo2: 'bar2' };

      await google.handler(req as any, res as any);

      expect(services.google.handleRequest.callCount).to.eql(1);
      expect(services.google.handleRequest.args[0]).to.eql([req, res]);
    });

    describe('handles errors', () => {
      it('without code and message', async () => {
        const services = {
          google: {
            handleRequest: sinon.stub().throws({}),
          },
        };
        const google = new Google(services as any, null as any);

        const req = {};
        const resSend = sinon.stub();
        const res = { status: sinon.stub().returns({ send: resSend }) };

        await google.handler(req as any, res as any);

        expect(res.status.args[0]).to.eql([500]);
        expect(resSend.args[0]).to.eql(['error']);
      });

      it('with code and message', async () => {
        const errObj = {
          code: 404,
          message: 'random msg',
        };

        const services = {
          google: {
            handleRequest: sinon.stub().throws(errObj),
          },
        };
        const google = new Google(services as any, null as any);

        const req = {};
        const resSend = sinon.stub();
        const res = { status: sinon.stub().returns({ send: resSend }) };

        await google.handler(req as any, res as any);

        expect(res.status.args[0]).to.eql([errObj.code]);
        expect(resSend.args[0]).to.eql([errObj.message]);
      });

      it('headers already sent', async () => {
        const services = {
          google: {
            handleRequest: sinon.stub().throws({}),
          },
        };
        const google = new Google(services as any, null as any);

        const req = {};
        const res = { status: sinon.stub(), headersSent: true };

        await google.handler(req as any, res as any);

        expect(res.status.callCount).to.eql(0);
      });
    });
  });
});
