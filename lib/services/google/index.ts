import { Request, Response } from 'express';

import { AbstractManager, injectServices } from '../types';
import Handler from './request';

@injectServices({ handler: Handler })
class GoogleManager extends AbstractManager<{ handler: Handler }> {
  async handleRequest(request: Request, response: Response) {
    const { WebhookClient, handler, metrics } = this.services;

    metrics.increment('google.invocation');

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
