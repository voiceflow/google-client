import {
  APIHandler,
  CodeHandler,
  EndHandler,
  FlowHandler,
  IfHandler,
  IntegrationsHandler,
  NextHandler,
  RandomHandler,
  ResetHandler,
  SetHandler,
  StartHandler,
} from '@voiceflow/runtime';

import { Config } from '@/types';

import _V1Handler from './_v1';
import CaptureHandler from './capture';
import CardHandler, { CardResponseBuilder, CardResponseBuilderV2 } from './card';
import ChoiceHandler, { ChipsResponseBuilder, ChipsResponseBuilderV2 } from './choice';
import DirectiveHandler, { DirectiveResponseBuilder } from './directive';
import InteractionHandler from './interaction';
import PreliminaryHandler from './preliminary';
import SpeakHandler from './speak';
import StreamHandler, { StreamResponseBuilder, StreamResponseBuilderV2 } from './stream';

export const responseHandlers = [CardResponseBuilder, StreamResponseBuilder, ChipsResponseBuilder];
export const responseHandlersV2 = [ChipsResponseBuilderV2, CardResponseBuilderV2, StreamResponseBuilderV2, DirectiveResponseBuilder];

// google handlers for V2 (conversational actions)
export const HandlersV2 = ({ API_HANDLER_ENDPOINT, INTEGRATIONS_HANDLER_ENDPOINT, CODE_HANDLER_ENDPOINT }: Config) => [
  PreliminaryHandler(),
  SpeakHandler(),
  CaptureHandler(),
  InteractionHandler('v2'),
  ResetHandler(),
  CardHandler(),
  DirectiveHandler(),
  ChoiceHandler(),
  StreamHandler(),
  CodeHandler({ endpoint: CODE_HANDLER_ENDPOINT }),
  EndHandler(),
  FlowHandler(),
  IfHandler(),
  APIHandler({ customAPIEndpoint: API_HANDLER_ENDPOINT }),
  IntegrationsHandler({ integrationsEndpoint: INTEGRATIONS_HANDLER_ENDPOINT }),
  RandomHandler(),
  SetHandler(),
  StartHandler(),
  NextHandler(),
  _V1Handler(),
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
  APIHandler({ customAPIEndpoint: API_HANDLER_ENDPOINT }),
  IntegrationsHandler({ integrationsEndpoint: INTEGRATIONS_HANDLER_ENDPOINT }),
  RandomHandler(),
  SetHandler(),
  StartHandler(),
  NextHandler(),
];

export default {
  v1: HandlersV1,
  v2: HandlersV2,
};
