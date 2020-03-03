import dice from 'talisman/metrics/distance/dice';
import jaccard from 'talisman/metrics/distance/jaccard';

type Choice = { value: string; index: number };

const getBestScore = (input: string, choices: Array<Choice>, tolerance = 0.9): number | null => {
  if (!input) return null;

  const best = choices.reduce(
    (acc: { choice: null | Choice; score: number }, choice) => {
      if (!choice.value) return acc;

      const sanitizedInput = input.toLowerCase();
      const match = choice.value.toLowerCase();
      let tempScore = jaccard(sanitizedInput, match) + dice(sanitizedInput, match);

      if (input.charAt(0) === match.charAt(0)) {
        tempScore += 0.1;
      }

      if (tempScore > acc.score) {
        acc = {
          score: tempScore,
          choice,
        };
      }

      return acc;
    },
    {
      choice: null,
      score: tolerance,
    }
  );

  return best.choice?.index ?? null;
};

export default getBestScore;
