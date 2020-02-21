import { Request, Response } from 'express';

import { AbstractManager } from '../utils';

class GoogleManager extends AbstractManager {
  handleRequest(request: Request, response: Response) {
    try {
      const { WebhookClient, handler } = this.services;

      request.body.versionID = request.params.versionID;

      const agent = new WebhookClient({
        request,
        response,
      });

      const intentMap = new Map();
      intentMap.set(null, handler.dialogflow.bind(handler));

      agent.handleRequest(intentMap);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('google manager', err);
    }
  }
}

export default GoogleManager;
