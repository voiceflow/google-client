import { ConversationV3 } from '@assistant/conversation';
import { Context, Request } from '@voiceflow/client';
import { DialogflowConversation } from 'actions-on-google';

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

export type ResponseBuilder = (context: Context, conv: DialogflowConversation<any>) => void | boolean;
export type ResponseBuilderV2 = (context: Context, conv: ConversationV3) => void | boolean;
