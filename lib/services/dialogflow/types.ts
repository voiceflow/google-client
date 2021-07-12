export type WebhookRequest = {
  responseId: string;
  queryResult: {
    queryText: string;
    parameters: Record<string, any>;
    allRequiredParamsPresent: boolean;
    outputContexts: Array<{ name: string; parameters: Record<string, any> }>;
    intent: { name: string; displayName: string };
    intentDetectionConfidence: number;
    languageCode: string;
  };
  originalDetectIntentRequest: { source?: string; payload: Record<string, any> };
  session: string;
};

type Text = { text: { text: string[] } };

type Image = {
  image: {
    imageUri: string;
    accessibilityText: string;
  };
};

type QuickReplies = {
  quickReplies: {
    title: string;
    quickReplies: string[];
  };
};

type Card = {
  card: {
    title: string;
    subtitle: string;
    imageUri: string;
    buttons: { text: string; postback: string }[];
  };
};

type Payload = Record<string, any>;

// https://cloud.google.com/dialogflow/es/docs/reference/rpc/google.cloud.dialogflow.v2beta1#message
export type ResponseMessage = Text | Image | QuickReplies | Card | Payload;

export type WebhookResponse = {
  fulfillmentText: string;
  fulfillmentMessages: ResponseMessage[];
  endInteraction: boolean;
};
