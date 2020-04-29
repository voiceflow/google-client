import secretsProvider from '@voiceflow/secrets-provider';
import { expect } from 'chai';
import _ from 'lodash';
import sinon from 'sinon';

import Metrics from '@/lib/clients/metrics';

describe('metrics client unit tests', () => {
  before(async () => {
    await secretsProvider.start({
      SECRETS_PROVIDER: 'test',
    });
  });

  beforeEach(() => {
    sinon.restore();
  });

  it('invocation', () => {
    const metrics = new Metrics({} as any);
    const increment = sinon.stub();
    _.set(metrics, 'client', { increment });

    metrics.invocation();
    expect(increment.args).to.eql([['google.invocation']]);
  });
});
