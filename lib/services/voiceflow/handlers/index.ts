import CaptureHandler from './capture';
import InteractionHandler from './interaction';
import ResetHandler from './reset';
import SpeakHandler from './speak';

export const responseHandlers = [];

export default [SpeakHandler, CaptureHandler, InteractionHandler, ResetHandler];
