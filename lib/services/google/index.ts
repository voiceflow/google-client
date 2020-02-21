import { Request, Response } from 'express';

import { AbstractManager } from '../utils';

class GoogleManager extends AbstractManager {
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
