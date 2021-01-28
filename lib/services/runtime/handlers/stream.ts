import { Image as GoogleImage, Media as GoogleMedia, Suggestion as GoogleSuggestion } from '@assistant/conversation';
import { Capability, MediaObject as GoogleMediaObject, MediaType, OptionalMediaControl } from '@assistant/conversation/dist/api/schema';
import { Node } from '@voiceflow/google-types/build/nodes/stream';
import { HandlerFactory } from '@voiceflow/runtime';
import { replaceVariables } from '@voiceflow/common';
import { Image, MediaObject, MediaObjectOptions, Suggestions } from 'actions-on-google';

import { F, S, T } from '@/lib/constants';

import { ResponseBuilder, ResponseBuilderV2 } from '../types';

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
): ResponseBuilder => (runtime, conv) => {
  const streamPlay = runtime.turn.get<StreamPlay>(T.STREAM_PLAY);

  if (!streamPlay) {
    return;
  }

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

    if (!runtime.turn.get(T.END) && !runtime.turn.get(T.CHIPS)) {
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
): ResponseBuilderV2 => (runtime, conv) => {
  const streamPlay = runtime.turn.get<StreamPlay>(T.STREAM_PLAY);

  if (!streamPlay) {
    return;
  }

  const { title, description, icon_img, background_img, url } = streamPlay;

  if (conv.device.capabilities!.includes(Capability.LongFormAudio)) {
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
      new MediaObjectBuilder({
        mediaObjects: [media],
        mediaType: MediaType.Audio,
        optionalMediaControls: [OptionalMediaControl.Paused, OptionalMediaControl.Stopped],
      })
    );

    if (!runtime.turn.get(T.END) && !runtime.turn.get(T.CHIPS)) {
      conv.add(new SuggestionsBuilder({ title: 'continue' }));
      conv.add(new SuggestionsBuilder({ title: 'exit' }));
    }
  } else {
    conv.add('Sorry, this device does not support audio playback.');
  }
};

export const StreamResponseBuilderV2 = StreamResponseBuilderGeneratorV2(GoogleImage, GoogleMedia, GoogleSuggestion);

const utilsObj = {
  replaceVariables,
};

export const StreamHandler: HandlerFactory<Node, typeof utilsObj> = (utils) => ({
  canHandle: (block) => !!block.play,
  handle: (block, runtime, variables) => {
    const variablesMap = variables.getState();
    const audioUrl = utils.replaceVariables(block.play, variablesMap);

    if (!audioUrl && block.gNextId) {
      return block.gNextId;
    }

    const streamTitle = utils.replaceVariables(block.title, variablesMap);

    runtime.turn.set<StreamPlay>(T.STREAM_PLAY, {
      url: audioUrl,
      title: streamTitle,
      description: utils.replaceVariables(block.description, variablesMap),
      icon_img: utils.replaceVariables(block.icon_img, variablesMap),
      background_img: utils.replaceVariables(block.background_img, variablesMap),
    });

    runtime.storage.produce((draft) => {
      if (!draft[S.OUTPUT].trim()) {
        draft[S.OUTPUT] = `Now Playing ${streamTitle || 'Media'}`;
      }
    });

    if (block.gNextId) {
      runtime.stack.top().storage.delete(F.SPEAK);
      runtime.stack.top().setNodeID(block.gNextId);
    } else {
      runtime.turn.set(T.END, true);
    }

    runtime.end();

    return null;
  },
});

export default () => StreamHandler(utilsObj);
