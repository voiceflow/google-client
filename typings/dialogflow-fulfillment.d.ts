// declare module 'dialogflow-fulfillment' {
//   import { Request, Response, RequestHandler } from 'express';

//   // eslint-disable-next-line import/prefer-default-export
//   export class WebhookClient {
//     public ACTIONS_ON_GOOGLE: string;

//     public requestSource: string;

//     constructor(options: { request: Request; response: Response });

//     handleRequest(map: Map<any, any>): RequestHandler;
//   }

//   export interface WebhookClientConstructor {
//     new (options: { request: Request; response: Response }): WebhookClient;
//   }
// }

declare module 'dialogflow-fulfillment' {
  import { DialogflowConversation } from 'actions-on-google';
  import { Request, Response } from 'express';

  export class RichResponse {
    platform: string;

    public setPlatform(platform: string): RichResponse;
  }

  export class Card extends RichResponse {
    constructor(card: string | object);

    public setButton(button: { text: string; url: string }): Card;

    public setImage(imageUrl: string): Card;

    public setText(text: string): Card;

    public setTitle(title: string): Card;

    private getV1ResponseObject_(platform: string): object;

    private getV2ResponseObject_(platform: string): object;
  }

  export class Image extends RichResponse {
    constructor(
      image:
        | string
        | {
            imageUrl: string;
            platform: string;
          }
    );

    public setImage(imageUrl: string): Image;

    private getV1ResponseObject_(platform: string): object;

    private getV2ResponseObject_(platform: string): object;
  }

  export class Payload extends RichResponse {
    payload: any;

    constructor(platform: string, payload: any, options?: { sendAsMessage?: boolean; rawPayload?: boolean });

    public setPayload(payload: string): Payload;

    private getPayload_(platform: string): object;

    private getV1ResponseObject_(platform: string): object;

    private getV2ResponseObject_(platform: string): object;
  }

  export class Suggestion extends RichResponse {
    constructor(suggestion: string | object);

    public setReply(reply: string): Suggestion;

    private addReply_(reply: string): void;

    private getV1ResponseObject_(platform: string): object;

    private getV2ResponseObject_(platform: string): object;
  }

  export class Text extends RichResponse {
    constructor(text: string | object);

    public setSsml(ssml: string): Text;

    public setText(text: string): Text;

    private getV1ResponseObject_(platform: string): object;

    private getV2ResponseObject_(platform: string): object;
  }

  /** Handles the communication with Dialogflow's webhook fulfillment API v1 & v2 with support for
   * rich responses across 8 platforms and Dialogflow's simulator */
  export class WebhookClient {
    /** The agent version (v1 or v2) based on Dialogflow webhook request */
    public readonly agentVersion: string;

    /** Dialogflow intent name or null if no value */
    public readonly intent: string;

    /** Dialogflow action or null if no value */
    public readonly action: string;

    /** Dialogflow parameters included in the request or null if no value */
    public readonly parameters: { [key: string]: string };

    /** Dialogflow contexts included in the request or null if no value */
    public readonly contexts: {
      name: string;
      lifespan: number;
      parameters: object;
    }[];

    /** Dialogflow source included in the request or null if no value  */
    public readonly requestSource: string;

    /** Dialogflow original request object from detectIntent/query or platform integration (Google Assistant, Slack, etc.)
     * in the request or null if no value */
    public readonly originalRequest: object;

    /** Original user query as indicated by Dialogflow or null if no value */
    public readonly query: string;

    /** Original request language code or locale (i.e. "en" or "en-US") */
    public readonly locale: string;

    /** Conversation session identifier of the format projects/{project}/agent/sessions/{session}
     * or projects/{project}/agent/environments/{environment}/users/{user}/sessions/{session}  */
    public readonly session: string;

    /** List of messages defined in Dialogflow's console for the matched intent */
    public readonly consoleMessages: RichResponse[];

    /** List of alternative query results. Query results can be from other Dialogflow intents or Knowledge Connectors */
    public readonly alternativeQueryResults: object;

    /**
     * Constructor for WebhookClient object To be used in the Dialogflow fulfillment webhook logic
     * @param options JSON configuration with { request: Express HTTP request object, response: Express HTTP response object }
     */
    constructor(options: { request: Request; response: Response } | object);

    /**
     * Add a response or list of responses to be sent to Dialogflow
     * @param responses (list) or single responses
     */
    public add(responses: RichResponse | string | RichResponse[] | string[] | DialogflowConversation): void;

    /**
     * Add a response or list of responses to be sent to Dialogflow and end the conversation.
     * Note: Only supported on Dialogflow v2's telephony gateway, Google Assistant and Alexa integrations
     * @param responses (list) or single responses
     */
    public end(responses: RichResponse | string | RichResponse[] | string[]): void;

    /**
     * Handles the incoming Dialogflow request using a handler or Map of handlers Each handler must be a function callback.
     * @param handler map of Dialogflow action name to handler function or function to handle all requests (regardless of Dialogflow action).
     */
    public handleRequest(handler: Map<string, (agent: WebhookClient) => void> | ((agent: WebhookClient) => void)): Promise<any>;

    /**
     * Set a new Dialogflow outgoing context
     * @param context name of context or an object representing a context
     */
    public setContext(context: string | object): WebhookClient;

    /**
     * Clear all existing outgoing contexts
     */
    public clearOutgoingContexts(): WebhookClient;

    /**
     * Clear an existing outgoing context
     * @param context name of an existing outgoing context
     */
    public clearContext(context: string): WebhookClient;

    /**
     * Get an context from the Dialogflow webhook request
     * @param contextName name of an context present in the Dialogflow webhook request
     */
    public getContext(
      contextName: string
    ): {
      name: string;
      lifespan: number;
      parameters: object;
    };

    /**
     * Set the followup event
     * @param event string with the name of the event or an event object
     */
    public setFollowupEvent(event: string | object): void;

    /**
     * Get Actions on Google DialogflowConversation object
     */
    public conv(): DialogflowConversation<any>;

    private existingSuggestion_(platform: string): Suggestion | null;

    private addResponse_(response: RichResponse | string): void;

    private existingPayload_(platform: string): Payload | null;

    private send_(): void;
  }

  export interface WebhookClientConstructor {
    new (options: { request: Request; response: Response }): WebhookClient;
  }
}

declare module 'dialogflow-fulfillment/src/rich-responses/rich-response' {
  export const PLATFORMS: {
    UNSPECIFIED: 'PLATFORM_UNSPECIFIED';
    FACEBOOK: 'FACEBOOK';
    SLACK: 'SLACK';
    TELEGRAM: 'TELEGRAM';
    KIK: 'KIK';
    SKYPE: 'SKYPE';
    LINE: 'LINE';
    VIBER: 'VIBER';
    ACTIONS_ON_GOOGLE: 'ACTIONS_ON_GOOGLE';
  };
}
