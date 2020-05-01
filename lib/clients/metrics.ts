import secretsProvider from '@voiceflow/secrets-provider';
import { BufferedMetricsLogger } from 'datadog-metrics';

import { Config } from '@/types';

export class Metrics {
  private client: BufferedMetricsLogger;

  constructor(config: Config, Logger: typeof BufferedMetricsLogger) {
    this.client = new Logger({
      apiKey: secretsProvider.get('DATADOG_API_KEY'),
      prefix: `vf-server.${config.NODE_ENV}`,
      flushIntervalSeconds: 5,
    });
  }

  invocation() {
    this.client.increment('google.invocation');
  }
}

const MetricsClient = (config: Config) => new Metrics(config, BufferedMetricsLogger);

export type MetricsType = Metrics;

export default MetricsClient;
