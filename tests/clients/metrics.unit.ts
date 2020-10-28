import { expect } from 'chai';
import _ from 'lodash';
import sinon from 'sinon';

import MetricsClient, { Metrics } from '@/lib/clients/metrics';
import testConfig from '@/tests/testConfig';

describe('metrics client unit tests', () => {
  beforeEach(() => {
    sinon.restore();
  });

  it('new', () => {
    const NODE_ENV = 'test';
    const loggerStub = sinon.stub().returns({
      increment: () => {
        //
      },
    });

    const metrics = new Metrics({ NODE_ENV, ...testConfig } as any, loggerStub as any);

    expect(typeof _.get(metrics, 'client.increment')).to.eql('function');

    expect(loggerStub.calledWithNew()).to.eql(true);
    expect(loggerStub.args).to.eql([
      [
        {
          apiKey: testConfig.DATADOG_API_KEY,
          prefix: `vf_server.${NODE_ENV}.`,
          flushIntervalSeconds: 5,
        },
      ],
    ]);
  });

  it('invocation', () => {
    const metrics = MetricsClient({} as any);
    const increment = sinon.stub();
    _.set(metrics, 'client', { increment });

    metrics.invocation();
    expect(increment.args).to.eql([['google.invocation']]);
  });
});
