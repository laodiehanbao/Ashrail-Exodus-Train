import { loadTestConfigs } from '../unit/loadTestConfigs.js';

const configs = loadTestConfigs();
let coin = 0;
let moduleFragments = 0;

for (let minute = 0; minute < 30; minute += 1) {
  const point = [...configs.economyCurve]
    .sort((left, right) => left.minute - right.minute)
    .filter((curvePoint) => curvePoint.minute <= minute)
    .at(-1);

  if (!point) {
    continue;
  }

  coin += point.coinPerMinute;
  moduleFragments += point.moduleFragmentPerMinute;

  if ((minute + 1) % 10 === 0) {
    console.info(`minute ${minute + 1}: coin=${coin}, moduleFragments=${moduleFragments}`);
  }
}
