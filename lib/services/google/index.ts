import { conversation } from '@assistant/conversation';
import { Request, Response } from 'express';

import { AbstractManager, injectServices } from '../types';
import Handler from './request';

@injectServices({ handler: Handler })
class GoogleManager extends AbstractManager<{ handler: Handler }> {
  async handleRequest(request: Request, response: Response) {
    const { handler, metrics } = this.services;

    metrics.invocation();

    // set default handler name
    request.body.handler.originalName = request.body.handler.name;
    request.body.handler.name = 'main';

    request.body.versionID = request.params.versionID;

    const app = conversation();

    app.handle('main', handler.dialogflow.bind(handler));

    return app(request, response);
  }
}

export default GoogleManager;
