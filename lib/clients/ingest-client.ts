import { State } from '@voiceflow/general-runtime/build/runtime';
import { FrameState } from '@voiceflow/general-runtime/build/runtime/lib/Runtime/Stack';
import { SimpleResponse } from 'actions-on-google';
import Axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import { GoogleRequest } from '../services/types';

export interface InteractBody {
  eventId: Event;
  request: {
    requestType?: string;
    sessionId?: string;
    versionId?: string;
    payload?: SimpleResponse | GoogleRequest;
    metadata?: {
      stack?: FrameState[];
      storage?: State;
      variables?: State;
    };
  };
}

export enum Event {
  INTERACT = 'interact',
}

export enum Request {
  REQUEST = 'request',
  LAUNCH = 'launch',
  RESPONSE = 'response',
}

export class IngestApi {
  private axios: AxiosInstance;

  public constructor(endpoint: string, authorization?: string) {
    const config: AxiosRequestConfig = {
      baseURL: endpoint,
    };

    if (authorization) {
      config.headers = {
        Authorization: authorization,
      };
    }

    this.axios = Axios.create(config);
  }

  public doIngest = async (body: InteractBody) => this.axios.post('/v1/ingest', body);
}

const IngestClient = (endpoint: string, authorization: string | undefined) => new IngestApi(endpoint, authorization);

export default IngestClient;
