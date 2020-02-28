import { Context, Request } from '@voiceflow/client';
import { ResponseBuilder as ASKResponseBuilder } from 'ask-sdk';

export type Mapping = { variable: string; slot: string };

export enum RequestType {
  INTENT = 'INTENT',
}

export enum IntentName {
  VOICEFLOW = 'VoiceFlowIntent',
}

export interface IntentRequestPayload {
  intent: string;
  input: string;
  slots: { [key: string]: string };
}

export interface IntentRequest extends Request {
  type: RequestType.INTENT;
  payload: IntentRequestPayload;
}

export type ResponseBuilder = (context: Context, builder: ASKResponseBuilder) => void | boolean;
