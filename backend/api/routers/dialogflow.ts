import bodyParser from '@voiceflow/body-parser';
import express from 'express';
import sjson from 'secure-json-parse';

import { BODY_PARSER_SIZE_LIMIT } from '@/backend/constants';
import { ControllerMap, MiddlewareMap } from '@/lib';

export default (_middlewares: MiddlewareMap, controllers: ControllerMap) => {
  const router = express.Router();

  router.use(bodyParser.json({ limit: BODY_PARSER_SIZE_LIMIT, customJSONParser: sjson.parse }));

  /**
   * webhook endpoint for dialogflow es agent
   */
  router.post('/es/:versionID', controllers.dialogflow.es);

  return router;
};
