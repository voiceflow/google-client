import { Suggestion as GoogleSuggestion } from '@assistant/conversation';
import { Node } from '@voiceflow/api-sdk';
import { HandlerFactory } from '@voiceflow/general-runtime/build/runtime';
import { Suggestions } from 'actions-on-google';

import { T } from '@/lib/constants';

import { IntentRequest, RequestType, ResponseBuilder, ResponseBuilderDialogflowES, ResponseBuilderV2 } from '../../types';
import { addChipsIfExistsV1, addRepromptIfExists } from '../../utils';
import CommandHandler from '../command';
import getBestScore from './score';

type Choice = Node<
  'choice',
  {
    chips?: string[];
    inputs: Array<string[]>;
    elseId?: string;
    choices: any[];
    nextIds: string[];
    reprompt?: string;
  }
>;

export const ChipsResponseBuilderGenerator = (SuggestionsBuilder: typeof Suggestions): ResponseBuilder => (runtime, conv) => {
  const chips = runtime.turn.get<string[]>(T.CHIPS);

  if (chips) {
    conv.add(new SuggestionsBuilder(chips));
  }
};

export const ChipsResponseBuilder = ChipsResponseBuilderGenerator(Suggestions);

export const ChipsResponseBuilderGeneratorV2 = (SuggestionsBuilder: typeof GoogleSuggestion): ResponseBuilderV2 => (runtime, conv) => {
  const chips = runtime.turn.get<string[]>(T.CHIPS);

  if (chips) {
    chips.forEach((chip) => conv.add(new SuggestionsBuilder({ title: chip })));
  }
};

export const ChipsResponseBuilderV2 = ChipsResponseBuilderGeneratorV2(GoogleSuggestion);

export const ChipsResponseBuilderDialogflowES: ResponseBuilderDialogflowES = (runtime, res) => {
  const chips = runtime.turn.get<string[]>(T.CHIPS);

  if (chips) {
    res.fulfillmentMessages.push({ quickReplies: { title: 'Suggestions', quickReplies: chips } });
  }
};

const utilsObj = {
  addRepromptIfExists,
  addChipsIfExists: addChipsIfExistsV1,
  getBestScore,
  commandHandler: CommandHandler(),
};

export const ChoiceHandler: HandlerFactory<Choice, typeof utilsObj> = (utils) => ({
  canHandle: (node) => !!node.choices,
  handle: (node, runtime, variables) => {
    const request = runtime.turn.get(T.REQUEST) as IntentRequest;

    if (request?.type !== RequestType.INTENT) {
      utils.addRepromptIfExists(node, runtime, variables);
      utils.addChipsIfExists(node, runtime, variables);
      // quit cycleStack without ending session by stopping on itself
      return node.id;
    }

    let nextId: string | null = null;

    const { input } = request.payload;

    let result = null;

    // flatten inputs
    const choices = node.inputs.reduce((acc: Array<{ value: string; index: number }>, option, index) => {
      option.forEach((item) => {
        acc.push({ value: item, index });
      });

      return acc;
    }, []);

    result = utils.getBestScore(input, choices);

    if (result != null && result in node.nextIds) {
      nextId = node.nextIds[result];
    }

    // check if there is a command in the stack that fulfills intent
    if (!nextId && utils.commandHandler.canHandle(runtime)) {
      return utils.commandHandler.handle(runtime, variables);
    }

    // request for this turn has been processed, delete request
    runtime.turn.delete(T.REQUEST);

    return (nextId || node.elseId) ?? null;
  },
});

export default () => ChoiceHandler(utilsObj);
