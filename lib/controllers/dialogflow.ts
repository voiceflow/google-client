import { Request } from 'express';

import { AbstractController } from './utils';

class DialogflowController extends AbstractController {
  async es(req: Request) {
    const { dialogflow } = this.services;

    return dialogflow.es(req.body, req.params.versionID);
  }
}

export default DialogflowController;
