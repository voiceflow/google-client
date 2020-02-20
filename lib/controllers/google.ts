import { Request, Response } from 'express';
import { param } from 'express-validator';

// import { validate } from '../utils';
import { AbstractController } from './utils';

class GoogleController extends AbstractController {
  static VALIDATIONS = {
    PARAMS: {
      versionID: param('versionID')
        .exists()
        .isString(),
    },
  };

  // TODO: @validate({ VERSION_ID: GoogleController.VALIDATIONS.PARAMS.versionID })
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
