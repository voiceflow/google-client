import { ConversationV3 } from '@assistant/conversation';
import Client, { DataAPI, Runtime } from '@voiceflow/general-runtime/build/runtime';
import { GoogleProgram, GoogleVersion } from '@voiceflow/google-types';
import { DialogflowConversation } from 'actions-on-google';

import { WebhookResponse } from '../dialogflow/types';

export enum RequestType {
  INTENT = 'INTENT',
  MEDIA_STATUS = 'MEDIA_STATUS',
}

export enum IntentName {
  VOICEFLOW = 'VoiceFlowIntent',
}

export interface IntentRequestPayload {
  intent: string;
  input: string;
  slots: { [key: string]: string };
}

export interface IntentRequest {
  type: RequestType.INTENT;
  payload: IntentRequestPayload;
}

export type GoogleRuntimeClient = Client<unknown, DataAPI<GoogleProgram, GoogleVersion>>;

export type GoogleRuntime = Runtime<unknown, DataAPI<GoogleProgram, GoogleVersion>>;

export type ResponseBuilder = (runtime: GoogleRuntime, conv: DialogflowConversation<any>) => void | boolean;

export type ResponseBuilderV2 = (runtime: GoogleRuntime, conv: ConversationV3) => void | boolean;

export type ResponseBuilderDialogflowES = (runtime: GoogleRuntime, res: WebhookResponse) => void | boolean;
