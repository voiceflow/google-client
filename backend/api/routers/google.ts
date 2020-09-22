import bodyParser from 'body-parser';
import express from 'express';

import { BODY_PARSER_SIZE_LIMIT } from '@/backend/constants';
import { ControllerMap, MiddlewareMap } from '@/lib';

export default (_middlewares: MiddlewareMap, controllers: ControllerMap) => {
  const router = express.Router();

  router.use(bodyParser.json({ limit: BODY_PARSER_SIZE_LIMIT }));
  router.post('/state/skill/gactions/:versionID', controllers.google.handler);
  router.post('/webhook/:versionID', controllers.google.handlerV2);

  return router;
};
