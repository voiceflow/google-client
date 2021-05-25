import {
  APIHandler,
  CodeHandler,
  EndHandler,
  FlowHandler,
  IfHandler,
  IfV2Handler,
  IntegrationsHandler,
  NextHandler,
  RandomHandler,
  ResetHandler,
  SetHandler,
  SetV2Handler,
  StartHandler,
} from '@voiceflow/runtime';

import { Config } from '@/types';

import _V1Handler from './_v1';
import CaptureHandler from './capture';
import CardHandler, { CardResponseBuilder, CardResponseBuilderDialogflowES, CardResponseBuilderV2 } from './card';
import ChoiceHandler, { ChipsResponseBuilder, ChipsResponseBuilderDialogflowES, ChipsResponseBuilderV2 } from './choice';
import DirectiveHandler, { DirectiveResponseBuilder } from './directive';
import InteractionHandler from './interaction';
import PreliminaryHandler from './preliminary';
import SpeakHandler from './speak';
import StreamHandler, { StreamResponseBuilder, StreamResponseBuilderV2 } from './stream';

export const responseHandlers = [CardResponseBuilder, StreamResponseBuilder, ChipsResponseBuilder];
export const responseHandlersV2 = [ChipsResponseBuilderV2, CardResponseBuilderV2, StreamResponseBuilderV2, DirectiveResponseBuilder];
export const responseHandlersDialogflowES = [ChipsResponseBuilderDialogflowES, CardResponseBuilderDialogflowES];
const _v1Handler = _V1Handler();

// handlers for dialogflow es agent
export const HandlersDialogflowES = ({ API_HANDLER_ENDPOINT, INTEGRATIONS_HANDLER_ENDPOINT, CODE_HANDLER_ENDPOINT }: Config) => [
  PreliminaryHandler(),
  SpeakHandler(),
  CaptureHandler(),
  InteractionHandler('v2'),
  ResetHandler(),
  CardHandler(),
  ChoiceHandler(),
  // todo: add pass-through stream handler (streams not supported in dialogflow es)
  CodeHandler({ endpoint: CODE_HANDLER_ENDPOINT }),
  EndHandler(),
  FlowHandler(),
  IfHandler(),
  IfV2Handler({ _v1: _v1Handler }),
  APIHandler({ customAPIEndpoint: API_HANDLER_ENDPOINT }),
  IntegrationsHandler({ integrationsEndpoint: INTEGRATIONS_HANDLER_ENDPOINT }),
  RandomHandler(),
  SetHandler(),
  SetV2Handler(),
  StartHandler(),
  NextHandler(),
  _v1Handler,
];

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
  IfV2Handler({ _v1: _v1Handler }),
  APIHandler({ customAPIEndpoint: API_HANDLER_ENDPOINT }),
  IntegrationsHandler({ integrationsEndpoint: INTEGRATIONS_HANDLER_ENDPOINT }),
  RandomHandler(),
  SetHandler(),
  SetV2Handler(),
  StartHandler(),
  NextHandler(),
  _v1Handler,
];

// google handlers for actions V1 (with dialogflow)
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
  dialogflowES: HandlersDialogflowES,
};
