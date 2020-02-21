import { Request, Response } from 'express';

import { AbstractController } from './utils';

class GoogleController extends AbstractController {
  handler = async (req: Request, res: Response) => {
    const { google } = this.services;

    try {
      return google.handleRequest(req, res);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('ERROR: ', err);
    }
  };
}

export default GoogleController;
