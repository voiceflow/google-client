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
  originalDetectIntentRequest: { payload: Record<string, any> };
  session: string;
};

export type WebhookResponse = {};
