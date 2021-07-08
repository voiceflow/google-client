import bodyParser from '@voiceflow/body-parser';
import express from 'express';
import { NextFunction, Request, Response } from 'express-serve-static-core';

import { BODY_PARSER_SIZE_LIMIT } from '@/backend/constants';
import { ControllerMap, MiddlewareMap } from '@/lib';

const logResponseBody = (_: Request, res: Response, next: NextFunction | undefined) => {
  const [oldWrite, oldEnd] = [res.write, res.end];
  const chunks: Buffer[] = [];

  (res.write as unknown) = function(chunk: any) {
    chunks.push(Buffer.from(chunk));
    // eslint-disable-next-line prefer-rest-params
    (oldWrite as Function).apply(res, arguments);
  };

  res.end = function(chunk) {
    if (chunk) {
      chunks.push(Buffer.from(chunk));
    }
    const body = Buffer.concat(chunks).toString('utf8');
    console.log('RESPONSE');
    console.log(body);
    // eslint-disable-next-line prefer-rest-params
    (oldEnd as Function).apply(res, arguments);
  };
  if (next) {
    return next();
  }
  return null;
};

export default (_middlewares: MiddlewareMap, controllers: ControllerMap) => {
  const router = express.Router();

  router.use(bodyParser.json({ limit: BODY_PARSER_SIZE_LIMIT }));

  router.use(logResponseBody);

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
