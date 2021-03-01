import Promise from 'bluebird';
import { Request, Response } from 'express';

import log from '../../logger';
import { AbstractController } from './utils';

class GoogleController extends AbstractController {
  handler = async (req: Request, res: Response) => {
    const { google } = this.services;

    /**
     * google (dialogflow) webhookclient builds the response so
     * handling errors here because unable to use responseBuilder.route
     */
    await Promise.try(() => google.handleRequest(req, res)).catch((err) => {
      log.error(`google handler err: ${err}`);
      if (!res.headersSent) res.status(err.code || 500).send(err.message ?? 'error');
    });
  };

  handlerV2 = async (req: Request, res: Response) => {
    const { googleV2 } = this.services;

    /**
     * googleV2 (conversational actions) webhookclient builds the response so
     * handling errors here because unable to use responseBuilder.route
     */
    await Promise.try(() => googleV2.handleRequest(req, res)).catch((err) => {
      log.error(`googleV2 handler err: ${err}`);
      if (!res.headersSent) res.status(err.code || 500).send(err.message ?? 'error');
    });
  };
}

export default GoogleController;
