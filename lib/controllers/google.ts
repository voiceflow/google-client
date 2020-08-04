import Promise from 'bluebird';
import { Request, Response } from 'express';

import log from '../../../logger';
import { AbstractController } from './utils';

class GoogleController extends AbstractController {
  handler = async (req: Request, res: Response) => {
    const { google } = this.services;

    /**
     * google webhookclient builds the response so
     * handling errors here because unable to use responseBuilder.route
     */
    await Promise.try(() => google.handleRequest(req, res)).catch((err) => {
      // eslint-disable-next-line no-console
      log.error('google handler err: ', err);
      res.status(err.code || 500).send(err.message ?? 'error');
    });
  };
}

export default GoogleController;
