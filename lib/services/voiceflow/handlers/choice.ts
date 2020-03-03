import { Handler } from '@voiceflow/client';

export type Choice = {
  random: boolean;
  nextId?: string;
};

const ChoiceHandler: Handler<Choice> = {
  canHandle: (block) => {
    return !!block.random;
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handle: (block, _context, _variables) => {
    return block.nextId ?? null;
  },
};

export default ChoiceHandler;
