import CaptureHandler from './capture';
import InteractionHandler from './interaction';
import SpeakHandler from './speak';

export const responseHandlers = [];

export default [SpeakHandler, CaptureHandler, InteractionHandler];
