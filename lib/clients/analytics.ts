import Rudderstack, { IdentifyRequest, TrackRequest } from '@rudderstack/rudder-sdk-node';
import { State } from '@voiceflow/general-runtime/build/runtime';
import { SimpleResponse } from 'actions-on-google';
import { AxiosResponse } from 'axios';

import log from '@/logger';
import { Config } from '@/types';

import { GoogleRequest } from '../services/types';
import IngestApiClient, { Event, IngestApi, InteractBody, RequestType } from './ingest-client';
import { AbstractClient } from './utils';

export class AnalyticsSystem extends AbstractClient {
  private rudderstackClient?: Rudderstack;

  private ingestClient?: IngestApi;

  private aggregateAnalytics = false;

  constructor(config: Config) {
    super(config);

    if (config.ANALYTICS_WRITE_KEY && config.ANALYTICS_ENDPOINT) {
      this.rudderstackClient = new Rudderstack(config.ANALYTICS_WRITE_KEY, `${config.ANALYTICS_ENDPOINT}/v1/batch`);
    }

    if (config.INGEST_WEBHOOK_ENDPOINT) {
      this.ingestClient = IngestApiClient(config.INGEST_WEBHOOK_ENDPOINT, undefined);
    }
    this.aggregateAnalytics = !config.IS_PRIVATE_CLOUD;
  }

  identify(id: string) {
    const payload: IdentifyRequest = {
      userId: id,
    };

    if (this.aggregateAnalytics && this.rudderstackClient) {
      log.trace('analytics: Identify');
      this.rudderstackClient.identify(payload);
    }
  }

  private callAnalyticsSystemTrack(id: string, eventId: Event, metadata: InteractBody) {
    const interactAnalyticsBody: TrackRequest = {
      userId: id,
      event: eventId,
      properties: {
        metadata,
      },
    };
    this.rudderstackClient!.track(interactAnalyticsBody);
  }

  private createInteractBody({
    id,
    eventId,
    request,
    payload,
    sessionid,
    metadata,
  }: {
    id: string;
    eventId: Event;
    request: RequestType;
    payload: SimpleResponse | GoogleRequest;
    sessionid: string;
    metadata: State;
  }): InteractBody {
    return {
      eventId,
      request: {
        requestType: request,
        sessionId: sessionid,
        versionId: id,
        payload,
        metadata: {
          stack: metadata.stack,
          storage: metadata.storage,
          variables: metadata.variables,
        },
      },
    } as InteractBody;
  }

  async track({
    id,
    event,
    request,
    payload,
    sessionid,
    metadata,
  }: {
    id: string;
    event: Event;
    request: RequestType;
    payload: SimpleResponse | GoogleRequest;
    sessionid: string;
    metadata: State;
  }): Promise<AxiosResponse<any> | undefined> {
    log.trace('analytics: Track');
    // eslint-disable-next-line sonarjs/no-small-switch
    switch (event) {
      case Event.INTERACT: {
        const interactIngestBody = this.createInteractBody({ id, eventId: event, request, payload, sessionid, metadata });

        // User/initial interact
        if (this.aggregateAnalytics && this.rudderstackClient) {
          this.callAnalyticsSystemTrack(id, event, interactIngestBody);
        }
        return this.ingestClient?.doIngest(interactIngestBody);
      }
      default:
        throw new RangeError(`Unknown event type: ${event}`);
    }
  }
}

const AnalyticsClient = (config: Config) => new AnalyticsSystem(config);

export default AnalyticsClient;
