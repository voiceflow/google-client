export enum Storage {
  OUTPUT = 'output',
  SESSIONS = 'sessions',
  REPEAT = 'repeat',
  LOCALE = 'locale',
  USER = 'user',
}

export enum Turn {
  END = 'end',
  PREVIOUS_OUTPUT = 'lastOutput',
  REPROMPT = 'reprompt',
  REQUEST = 'request',
}

export enum Frame {
  SPEAK = 'speak',
  CALLED_COMMAND = 'calledCommand',
}

export default {
  Storage,
  Turn,
  Frame,
};
