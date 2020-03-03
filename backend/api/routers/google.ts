import bodyParser from 'body-parser';
import express from 'express';

import { ControllerMap, MiddlewareMap } from '@/lib';

export default (_middlewares: MiddlewareMap, controllers: ControllerMap) => {
  const router = express.Router();

  router.use(bodyParser.json());
  router.post('/state/skill/gactions/:versionID', controllers.google.handler);

  return router;
};
