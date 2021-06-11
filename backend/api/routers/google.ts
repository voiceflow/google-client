import bodyParser from '@voiceflow/body-parser';
import express from 'express';
import sjson from 'secure-json-parse';

import { BODY_PARSER_SIZE_LIMIT } from '@/backend/constants';
import { ControllerMap, MiddlewareMap } from '@/lib';

export default (_middlewares: MiddlewareMap, controllers: ControllerMap) => {
  const router = express.Router();

  router.use(bodyParser.json({ limit: BODY_PARSER_SIZE_LIMIT, customJSONParser: sjson.parse }));

  /**
   * webhook endpoint for legacy dialogflow google actions system
   */
  router.post('/state/skill/gactions/:versionID', controllers.google.handler);

  /**
   * webhook endpoint for current conversational actions google system
   */
  router.post('/webhook/:versionID', controllers.google.handlerV2);

  return router;
};
