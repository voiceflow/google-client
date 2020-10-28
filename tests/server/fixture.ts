import { FixtureGenerator } from '@voiceflow/backend-utils';

import testConfig from '@/tests/testConfig';

import { ServiceManager } from '../../backend';
import config from '../../config';

const createFixture = async () => {
  const serviceManager = new ServiceManager({
    ...config,
    ...testConfig,
  });

  return FixtureGenerator.createFixture(serviceManager);
};

export default {
  createFixture,
  checkFixture: FixtureGenerator.checkFixture,
};
