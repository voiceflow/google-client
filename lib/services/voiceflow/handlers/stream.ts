import { Image as GoogleImage, Media as GoogleMedia, Suggestion as GoogleSuggestion } from '@assistant/conversation';
import { Capability, MediaObject as GoogleMediaObject, MediaType, OptionalMediaControl } from '@assistant/conversation/dist/api/schema';
import { HandlerFactory } from '@voiceflow/client';
import { Image, MediaObject, MediaObjectOptions, Suggestions } from 'actions-on-google';

import { F, S, T } from '@/lib/constants';

import { ResponseBuilder, ResponseBuilderV2 } from '../types';
import { addChipsIfExists, regexVariables } from '../utils';

type StreamBlock = {
  play: string;
  gNextId?: string;
  icon_img: string;
  background_img: string;
  description: string;
  title: string;
  chips?: string[];
};

type StreamPlay = {
  url: string;
  title: string;
  description: string;
  icon_img: string;
  background_img: string;
};

export const StreamResponseBuilderGenerator = (
  ImageBuilder: typeof Image,
  MediaObjectBuilder: typeof MediaObject,
  SuggestionsBuilder: typeof Suggestions
): ResponseBuilder => (context, conv) => {
  const streamPlay = context.turn.get(T.STREAM_PLAY);

  if (!streamPlay) return;

  const { title, description, icon_img, background_img, url } = streamPlay;

  if (conv.surface.capabilities.has('actions.capability.MEDIA_RESPONSE_AUDIO')) {
    const media: MediaObjectOptions = {
      name: title,
      url,
      description,
    };

    if (background_img) {
      media.image = new ImageBuilder({
        url: background_img,
        alt: 'Media Background Image',
      });
    } else if (icon_img) {
      media.icon = new ImageBuilder({
        url: icon_img,
        alt: 'Media Icon Image',
      });
    }

    conv.add(new MediaObjectBuilder(media));

    if (!context.turn.get(T.END) && !context.turn.get(T.CHIPS)) {
      conv.add(new SuggestionsBuilder(['continue', 'exit']));
    }
  } else {
    conv.add('Sorry, this device does not support audio playback.');
  }
};

export const StreamResponseBuilder = StreamResponseBuilderGenerator(Image, MediaObject, Suggestions);

export const StreamResponseBuilderGeneratorV2 = (
  ImageBuilder: typeof GoogleImage,
  MediaObjectBuilder: typeof GoogleMedia,
  SuggestionsBuilder: typeof GoogleSuggestion
): ResponseBuilderV2 => (context, conv) => {
  const streamPlay = context.turn.get(T.STREAM_PLAY);

  if (!streamPlay) return;

  const { title, description, icon_img, background_img, url } = streamPlay;

  if (conv.device.capabilities!.includes(Capability.RichResponse) && conv.device.capabilities!.includes(Capability.LongFormAudio)) {
    const media = {
      name: title,
      description,
      url,
      image: {
        icon: undefined,
        large: undefined,
      },
    } as GoogleMediaObject;

    if (background_img) {
      media.image!.large = new ImageBuilder({
        url: background_img,
        alt: 'Media Background Image',
      });
    } else if (icon_img) {
      media.image!.icon = new ImageBuilder({
        url: icon_img,
        alt: 'Media Icon Image',
      });
    }

    conv.add(
      // todo: remove ts-ignore when this is solved: https://github.com/actions-on-google/assistant-conversation-nodejs/issues/7
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      new MediaObjectBuilder({
        mediaObjects: [media],
        mediaType: MediaType.Audio,
        optionalMediaControls: [OptionalMediaControl.Paused, OptionalMediaControl.Stopped],
      })
    );

    if (!context.turn.get(T.END) && !context.turn.get(T.CHIPS)) {
      conv.add(new SuggestionsBuilder({ title: 'continue' }));
      conv.add(new SuggestionsBuilder({ title: 'exit' }));
    }
  } else {
    conv.add('Sorry, this device does not support audio playback.');
  }
};

export const StreamResponseBuilderV2 = StreamResponseBuilderGeneratorV2(GoogleImage, GoogleMedia, GoogleSuggestion);

const utilsObj = {
  regexVariables,
  addChipsIfExists,
};

export const StreamHandler: HandlerFactory<StreamBlock, typeof utilsObj> = (utils) => ({
  canHandle: (block) => {
    return !!block.play;
  },
  handle: (block, context, variables) => {
    const variablesMap = variables.getState();
    const audioUrl = utils.regexVariables(block.play, variablesMap);

    if (!audioUrl && block.gNextId) {
      return block.gNextId;
    }

    const streamTitle = utils.regexVariables(block.title, variablesMap);

    context.turn.set(T.STREAM_PLAY, {
      url: audioUrl,
      title: streamTitle,
      description: utils.regexVariables(block.description, variablesMap),
      icon_img: utils.regexVariables(block.icon_img, variablesMap),
      background_img: utils.regexVariables(block.background_img, variablesMap),
    } as StreamPlay);

    context.storage.produce((draft) => {
      if (!draft[S.OUTPUT].trim()) {
        draft[S.OUTPUT] = `Now Playing ${streamTitle || 'Media'}`;
      }
    });

    utils.addChipsIfExists(block, context, variables);

    if (block.gNextId) {
      context.stack.top().storage.delete(F.SPEAK);
      context.stack.top().setBlockID(block.gNextId);
    } else {
      context.turn.set(T.END, true);
    }

    context.end();
    return null;
  },
});

export default () => StreamHandler(utilsObj);
