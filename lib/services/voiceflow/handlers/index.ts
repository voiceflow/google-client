import CaptureHandler from './capture';
import CardHandler, { CardResponseBuilder } from './card';
import ChoiceHandler from './choice';
import InteractionHandler from './interaction';
import ResetHandler from './reset';
import SpeakHandler from './speak';

export const responseHandlers = [CardResponseBuilder];

export default [SpeakHandler, CaptureHandler, InteractionHandler, ResetHandler, CardHandler, ChoiceHandler];
