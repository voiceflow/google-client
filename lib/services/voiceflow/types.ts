import { Context, Request } from '@voiceflow/client';
import { DialogflowConversation } from 'actions-on-google';

export type Mapping = { variable: string; slot: string };

export enum RequestType {
  INTENT = 'INTENT',
}

export enum IntentName {
  VOICEFLOW = 'VoiceFlowIntent',
  YES = 'yes',
  NO = 'no',
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

export type ResponseBuilder = (context: Context, conv: DialogflowConversation<any>) => void | boolean;
