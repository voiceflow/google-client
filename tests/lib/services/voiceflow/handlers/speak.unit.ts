import { expect } from 'chai';
import sinon from 'sinon';

import { F, S } from '@/lib/constants';
import SpeakHandler from '@/lib/services/voiceflow/handlers/speak';

describe('speak handler unit tests', async () => {
  afterEach(() => sinon.restore());

  describe('canHandle', () => {
    it('false', async () => {
      expect(SpeakHandler.canHandle({} as any, null as any, null as any, null as any)).to.eql(false);
      expect(SpeakHandler.canHandle({ prompt: 'true' } as any, null as any, null as any, null as any)).to.eql(false);
      expect(SpeakHandler.canHandle({ prompt: 1 } as any, null as any, null as any, null as any)).to.eql(false);
    });

    it('true', async () => {
      expect(SpeakHandler.canHandle({ random_speak: ['a', 'b', 'c'] } as any, null as any, null as any, null as any)).to.eql(true);
      expect(SpeakHandler.canHandle({ audio: 'url' } as any, null as any, null as any, null as any)).to.eql(true);
      expect(SpeakHandler.canHandle({ prompt: 'false' } as any, null as any, null as any, null as any)).to.eql(true);
      expect(SpeakHandler.canHandle({ speak: 'hi' } as any, null as any, null as any, null as any)).to.eql(true);
    });
  });

  describe('handle', () => {
    it('random speak', () => {
      const block = {
        nextId: 'next-id',
        random_speak: ['one', 'two', 'three'],
      };

      const topFrame = {
        storage: { set: sinon.stub() },
      };
      const context = {
        storage: { produce: sinon.stub() },
        stack: { top: sinon.stub().returns(topFrame) },
      };
      const variables = { getState: sinon.stub().returns({}) };

      expect(SpeakHandler.handle(block as any, context as any, variables as any, null as any)).to.eql(block.nextId);
      expect(topFrame.storage.set.args[0][0]).to.eql(F.SPEAK);
      // output is one of the options in random_speak
      expect(block.random_speak.includes(topFrame.storage.set.args[0][1])).to.eql(true);
    });

    it('speak', () => {
      const block = {
        speak: 'random {var} or {var1}',
      };

      const topFrame = {
        storage: { set: sinon.stub() },
      };
      const context = {
        storage: { produce: sinon.stub() },
        stack: { top: sinon.stub().returns(topFrame) },
      };
      const varState = { var: 1.234, var1: 'here' };
      const variables = { getState: sinon.stub().returns(varState) };

      expect(SpeakHandler.handle(block as any, context as any, variables as any, null as any)).to.eql(null);
      // output has vars replaced and numbers turned to 2digits floats
      expect(topFrame.storage.set.args).to.eql([[F.SPEAK, 'random 1.23 or here']]);

      const fn = context.storage.produce.args[0][0];

      const draft = {
        [S.OUTPUT]: 'previous ',
      };

      fn(draft);

      expect(draft[S.OUTPUT]).to.eq('previous random 1.23 or here');
    });

    it('speak is not string', () => {
      const block = {
        speak: 1,
      };

      const context = {
        storage: { produce: sinon.stub() },
      };
      const variables = { getState: sinon.stub().returns({}) };

      expect(SpeakHandler.handle(block as any, context as any, variables as any, null as any)).to.eql(null);
      expect(context.storage.produce.callCount).to.eql(0);
    });
  });
});
