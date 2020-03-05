import { Request, Response } from 'express';

import { AbstractManager, injectServices } from '../utils';
import Handler from './handler';

@injectServices({ handler: Handler })
class GoogleManager extends AbstractManager<{ handler: Handler }> {
  async handleRequest(request: Request, response: Response) {
    const { WebhookClient, handler } = this.services;

    request.body.versionID = request.params.versionID;

    const agent = new WebhookClient({
      request,
      response,
    });

    const intentMap = new Map();
    intentMap.set(null, handler.dialogflow.bind(handler));

    return agent.handleRequest(intentMap);
  }
}

export default GoogleManager;
