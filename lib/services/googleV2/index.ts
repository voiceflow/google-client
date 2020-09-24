import { Request, Response } from 'express';

import { AbstractManager, injectServices } from '../types';
import Handler from './request';

@injectServices({ handler: Handler })
class GoogleManager extends AbstractManager<{ handler: Handler }> {
  static SLOT_FILLING_PREFIX = 'slot_filling_';

  async handleRequest(request: Request, response: Response) {
    const { GoogleConversation, handler, metrics } = this.services;

    metrics.invocation();

    // set default handler name
    request.body.handler.originalName = request.body.handler.name;
    request.body.handler.name = 'main';

    // slot filling - dialog management
    if (request.body.handler.originalName.startsWith(GoogleManager.SLOT_FILLING_PREFIX)) {
      request.body.intent.name = request.body.handler.originalName.substring(GoogleManager.SLOT_FILLING_PREFIX.length);
    }

    request.body.versionID = request.params.versionID;

    const app = GoogleConversation();

    app.handle('main', handler.handle.bind(handler));

    return app(request, response);
  }
}

export default GoogleManager;
