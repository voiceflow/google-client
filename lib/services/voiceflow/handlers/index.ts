import {
  CodeHandler,
  EndHandler,
  FlowHandler,
  IfHandler,
  IntegrationsHandler,
  NextHandler,
  RandomHandler,
  SetHandler,
  StartHandler,
} from '@voiceflow/client';

import { Config } from '@/types';

import CaptureHandler from './capture';
import CardHandler, { CardResponseBuilder } from './card';
import ChoiceHandler, { ChipsResponseBuilder, ChipsResponseBuilderV2 } from './choice';
import InteractionHandler from './interaction';
import ResetHandler from './reset';
import SpeakHandler from './speak';
import StreamHandler, { StreamResponseBuilder } from './stream';

export const responseHandlers = [CardResponseBuilder, StreamResponseBuilder, ChipsResponseBuilder];
export const responseHandlersV2 = [ChipsResponseBuilderV2];

// google handlers for V2 (conversational actions)
export const HandlersV2 = ({ API_HANDLER_ENDPOINT, INTEGRATIONS_HANDLER_ENDPOINT, CODE_HANDLER_ENDPOINT }: Config) => [
  SpeakHandler(),
  CaptureHandler(),
  InteractionHandler(),
  ResetHandler(),
  CardHandler(),
  ChoiceHandler(),
  StreamHandler(),
  CodeHandler({ endpoint: CODE_HANDLER_ENDPOINT }),
  EndHandler(),
  FlowHandler(),
  IfHandler(),
  IntegrationsHandler({ customAPIEndpoint: API_HANDLER_ENDPOINT, integrationsLambdaEndpoint: INTEGRATIONS_HANDLER_ENDPOINT }),
  RandomHandler(),
  SetHandler(),
  StartHandler(),
  NextHandler(),
];

// google handlers for V1 (dialogflow)
export const HandlersV1 = ({ API_HANDLER_ENDPOINT, INTEGRATIONS_HANDLER_ENDPOINT, CODE_HANDLER_ENDPOINT }: Config) => [
  SpeakHandler(),
  CaptureHandler(),
  InteractionHandler(),
  ResetHandler(),
  CardHandler(),
  ChoiceHandler(),
  StreamHandler(),
  CodeHandler({ endpoint: CODE_HANDLER_ENDPOINT }),
  EndHandler(),
  FlowHandler(),
  IfHandler(),
  IntegrationsHandler({ customAPIEndpoint: API_HANDLER_ENDPOINT, integrationsLambdaEndpoint: INTEGRATIONS_HANDLER_ENDPOINT }),
  RandomHandler(),
  SetHandler(),
  StartHandler(),
  NextHandler(),
];

export default {
  v1: HandlersV1,
  v2: HandlersV2,
};
