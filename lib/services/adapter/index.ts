import log from '../../../logger';
import { AbstractManager } from '../types';
import { NewStateRaw, OldStateRaw } from './types';
import { stackAdapter, storageAdapter, variablesAdapter } from './utils';

/**
 * Adapter to transform old vf-server sessions into the new format
 * The intention is to remove this adapter once we switch all users over
 */
class AdapterManager extends AbstractManager {
  async state(state: OldStateRaw): Promise<NewStateRaw | {}> {
    try {
      return {
        stack: stackAdapter(state),
        storage: storageAdapter(state),
        variables: variablesAdapter(state),
      };
    } catch (err) {
      // eslint-disable-next-line no-console
      log.error('state adapter err: ', err.message);
      return {};
    }
  }
}

export default AdapterManager;
