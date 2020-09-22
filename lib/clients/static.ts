import { conversation as GoogleConversation } from '@assistant/conversation';
import axios from 'axios';
import { WebhookClient } from 'dialogflow-fulfillment';
import randomstring from 'randomstring';
import uuid4 from 'uuid/v4';

export default {
  axios,
  WebhookClient,
  uuid4,
  randomstring,
  GoogleConversation,
};
