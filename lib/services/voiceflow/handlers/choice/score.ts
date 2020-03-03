import dice from 'talisman/metrics/distance/dice';
import jaccard from 'talisman/metrics/distance/jaccard';

const getBestScore = (a: any, b: any, tolerance = 0.9) => {
  if (!a) return null;

  let best = null;
  let score = tolerance;

  // eslint-disable-next-line no-restricted-syntax
  for (const target of b) {
    if (target.string) {
      const input = a.toLowerCase();
      const match = target.string.toLowerCase();
      let temp = 1 - jaccard(input, match) + dice(input, match);

      if (input.charAt(0) === match.charAt(0)) {
        temp += 0.1;
      }

      if (temp > score) {
        score = temp;
        best = target;
      }
    }
  }

  if (best) {
    return best.value || best.value === 0 ? best.value : best.string;
  }
  return null;
};

export default getBestScore;
