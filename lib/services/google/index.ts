import { Request, Response } from 'express';

import { AbstractManager, Config, FullServiceMap } from '../utils';
import Handler from './handler';

class GoogleManager extends AbstractManager<{ handler: Handler }> {
  constructor(services: FullServiceMap, config: Config) {
    const handler = new Handler(services, config);

    super({ ...services, handler }, config);
  }

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
