import { expect } from 'chai';
import sinon from 'sinon';

import AdapterManager from '@/lib/services/adapter';

import {
  newCommands,
  newExit,
  newFramesVariables,
  newMalformed,
  newMissing,
  newOutputMap,
  newRandoms,
  oldCommands,
  oldDiagramsVariables,
  oldExit,
  oldMalformed,
  oldMissing,
  oldOutputMap,
  oldRandoms,
} from './fixtures';

describe('adapterManager unit tests', async () => {
  afterEach(() => sinon.restore());

  describe('context', () => {
    const tests = [
      { text: 'malformed', old: oldMalformed, new: newMalformed },
      { text: 'randoms', old: oldRandoms, new: newRandoms },
      { text: 'missing attributes', old: oldMissing, new: newMissing },
      { text: 'outputmap', old: oldOutputMap, new: newOutputMap },
      { text: 'local variables', old: oldDiagramsVariables, new: newFramesVariables },
      { text: 'commands', old: oldCommands, new: newCommands },
      { text: 'resume after exiting', old: oldExit, new: newExit },
    ];

    tests.forEach((test) => {
      it(test.text, async () => {
        const adapter = new AdapterManager(null as any, null as any);

        expect(await adapter.context(test.old as any)).to.eql(test.new);
      });
    });
  });
});
