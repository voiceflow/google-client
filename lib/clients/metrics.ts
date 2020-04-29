import secretsProvider from '@voiceflow/secrets-provider';
import { BufferedMetricsLogger } from 'datadog-metrics';

import { Config } from '@/types';

class Metrics {
  private client: BufferedMetricsLogger;

  constructor(config: Config) {
    this.client = new BufferedMetricsLogger({
      apiKey: secretsProvider.get('DATADOG_API_KEY'),
      prefix: `vf-server.${config.NODE_ENV}`,
      flushIntervalSeconds: 5,
    });
  }

  invocation() {
    this.client.increment('google.invocation');
  }
}

export default Metrics;
