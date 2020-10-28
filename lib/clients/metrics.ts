import { BufferedMetricsLogger } from 'datadog-metrics';

import { Config } from '@/types';

export class Metrics {
  private client: BufferedMetricsLogger;

  constructor(config: Config, Logger: typeof BufferedMetricsLogger) {
    this.client = new Logger({
      apiKey: config.DATADOG_API_KEY,
      prefix: `vf_server.${config.NODE_ENV}.`,
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
