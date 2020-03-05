import { Handler } from '@voiceflow/client';
import { Image, MediaObject, MediaObjectOptions, Suggestions } from 'actions-on-google';

import { F, S, T } from '@/lib/constants';

import { ResponseBuilder } from '../types';
import { regexVariables } from '../utils';

type StreamBlock = {
  play: string;
  gNextId?: string;
  icon_img: string;
  background_img: string;
  description: string;
  title: string;
};

type StreamPlay = {
  url: string;
  title: string;
  description: string;
  icon_img: string;
  background_img: string;
};

export const StreamResponseBuilder: ResponseBuilder = (context, conv) => {
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
      media.image = new Image({
        url: background_img,
        alt: 'Media Background Image',
      });
    } else if (icon_img) {
      media.icon = new Image({
        url: icon_img,
        alt: 'Media Icon Image',
      });
    }

    conv.add(new MediaObject(media));

    if (!context.turn.get(T.END)) {
      conv.add(new Suggestions(['continue', 'exit']));
    }
  } else {
    conv.add('Sorry, this device does not support audio playback.');
  }
};

const StreamHandler: Handler<StreamBlock> = {
  canHandle: (block) => {
    return !!block.play;
  },
  handle: (block, context, variables) => {
    const variablesMap = variables.getState();
    const audioUrl = regexVariables(block.play, variablesMap);

    if (!audioUrl && block.gNextId) {
      return block.gNextId;
    }

    const streamTitle = regexVariables(block.title, variablesMap);

    context.turn.set(T.STREAM_PLAY, {
      url: audioUrl,
      title: streamTitle,
      description: regexVariables(block.description, variablesMap),
      icon_img: regexVariables(block.icon_img, variablesMap),
      background_img: regexVariables(block.background_img, variablesMap),
    } as StreamPlay);

    context.storage.produce((draft) => {
      if (!draft[S.OUTPUT].trim()) {
        draft[S.OUTPUT] = `Now Playing ${streamTitle || 'Media'}`;
      }
    });

    if (block.gNextId) {
      context.stack.top().storage.delete(F.SPEAK);
      context.stack.top().setBlockID(block.gNextId);
    } else {
      context.turn.set(T.END, true);
    }

    context.end();
    return null;
  },
};

export default StreamHandler;
