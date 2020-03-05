import { ManagerFunction } from '../utils';
import Google from './google';
import Handler from './handler';

const Manager: ManagerFunction = (services, config) => {
  const handler = Handler(services, config);

  return new Google({ ...services, handler }, config);
};

export default Manager;
