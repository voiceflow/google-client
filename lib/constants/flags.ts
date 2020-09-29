export enum Storage {
  OUTPUT = 'output',
  SESSIONS = 'sessions',
  REPEAT = 'repeat',
  LOCALE = 'locale',
  USER = 'user',
  NO_MATCHES_COUNTER = 'noMatchesCounter',
  REPROMPT = 'reprompt',
}

export enum Turn {
  END = 'end',
  PREVIOUS_OUTPUT = 'lastOutput',
  REQUEST = 'request',
  CARD = 'card',
  STREAM_PLAY = 'stream_play',
  CHIPS = 'chips',
}

export enum Frame {
  SPEAK = 'speak',
  CALLED_COMMAND = 'calledCommand',
}

export enum Variables {
  TIMESTAMP = 'timestamp',
}

export default {
  Storage,
  Turn,
  Frame,
};
