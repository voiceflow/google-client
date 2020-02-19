import { Request, Response } from 'express';
import { param } from 'express-validator';

import { validate } from '../utils';
import { AbstractController } from './utils';

class GoogleController extends AbstractController {
  static VALIDATIONS = {
    PARAMS: {
      versionID: param('versionID')
        .exists()
        .isString(),
    },
  };

  @validate({ VERSION_ID: GoogleController.VALIDATIONS.PARAMS.versionID })
  async handler(req: Request, res: Response) {
    const { google } = this.services;

    return google.handleRequest(req, res);
  }
}

export default GoogleController;
