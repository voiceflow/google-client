import { ManagerFunction } from '@/lib/services/utils';

import Handler from './handler';
import Context from './lifecycle/context';
import Initialize from './lifecycle/initialize';
import Response from './lifecycle/response';

const Manager: ManagerFunction = (services, config) => {
  const initialize = new Initialize(services, config);
  const context = new Context(services, config);
  const response = new Response(services, config);

  return new Handler({ ...services, initialize, context, response }, config);
};

export default Manager;
