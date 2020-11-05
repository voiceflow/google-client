import { conversation as GoogleConversation } from '@assistant/conversation';
import axios from 'axios';
import { WebhookClient } from 'dialogflow-fulfillment';
import fs from 'fs';
import path from 'path';
import randomstring from 'randomstring';
import uuid4 from 'uuid/v4';

const Static = {
  fs,
  path,
  axios,
  uuid4,
  randomstring,
  WebhookClient,
  GoogleConversation,
} as const;

export type StaticType = typeof Static;

export default Static;
