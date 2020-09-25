import { expect } from 'chai';
import sinon from 'sinon';

import { T, V } from '@/lib/constants';
import HandlerManager from '@/lib/services/googleV2/request';
import { RequestType } from '@/lib/services/voiceflow/types';

describe('handlerManager unit tests', async () => {
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers(Date.now()); // fake Date.now
  });
  afterEach(() => {
    clock.restore(); // restore Date.now
    sinon.restore();
  });

  describe('_extractSlots', () => {
    describe('slot filling', () => {
      it('without slots', () => {
        const conv = {
          request: { handler: { originalName: 'slot_filling_travel_intent' } },
          scene: {},
        };

        const handlerManager = new HandlerManager({} as any, null as any);
        expect(handlerManager._extractSlots(conv as any)).to.eql({});
      });

      it('with slots', () => {
        const conv = {
          request: { handler: { originalName: 'slot_filling_travel_intent' } },
          scene: {
            slots: {
              slotone: {
                value: 'one',
              },
              slottwo: {
                value: 'two',
              },
            },
          },
        };

        const handlerManager = new HandlerManager({} as any, null as any);
        expect(handlerManager._extractSlots(conv as any)).to.eql({ slotone: 'one', slottwo: 'two' });
      });
    });

    describe('intent matching', () => {
      it('without slots', () => {
        const conv = {
          request: { handler: { originalName: 'main' } },
          intent: {},
        };

        const handlerManager = new HandlerManager({} as any, null as any);
        expect(handlerManager._extractSlots(conv as any)).to.eql({});
      });

      it('with slots', () => {
        const conv = {
          request: { handler: { originalName: 'main' } },
          intent: {
            params: {
              slotone: {
                resolved: 'one',
              },
              slottwo: {
                resolved: 'two',
              },
            },
          },
        };

        const handlerManager = new HandlerManager({} as any, null as any);
        expect(handlerManager._extractSlots(conv as any)).to.eql({ slotone: 'one', slottwo: 'two' });
      });
    });
  });

  describe('handle', () => {
    it('main intent', async () => {
      const contextObj = {
        stack: {
          isEmpty: sinon.stub().returns(false),
        },
        variables: {
          set: sinon.stub(),
        },
        update: sinon.stub(),
      };

      const services = {
        initialize: {
          build: sinon.stub(),
        },
        context: {
          build: sinon.stub().returns(contextObj),
        },
        response: {
          build: sinon.stub(),
        },
      };

      const conv = {
        intent: { name: 'actions.intent.MAIN', query: 'input raw' },
        scene: { slots: {} },
        request: {
          versionID: 'version-id',
        },
        user: {
          params: {
            userId: 'user-id',
          },
        },
      };

      const handlerManager = new HandlerManager(services as any, null as any);
      handlerManager._extractSlots = sinon.stub().returns({});

      await handlerManager.handle(conv as any);

      expect(services.context.build.args[0]).to.eql([conv.request.versionID, conv.user.params.userId]);
      expect(services.initialize.build.args[0]).to.eql([contextObj, conv]);
      expect(contextObj.variables.set.args).to.eql([[V.TIMESTAMP, Math.floor(clock.now / 1000)]]);
      expect(contextObj.update.callCount).to.eql(1);
      expect(services.response.build.args[0]).to.eql([contextObj, conv]);
    });

    it('default welcome intent', async () => {
      const contextObj = {
        stack: {
          isEmpty: sinon.stub().returns(false),
        },
        variables: {
          set: sinon.stub(),
        },
        update: sinon.stub(),
      };

      const services = {
        initialize: {
          build: sinon.stub(),
        },
        context: {
          build: sinon.stub().returns(contextObj),
        },
        response: {
          build: sinon.stub(),
        },
      };

      const conv = {
        intent: { name: 'Default Welcome Intent', query: 'input raw' },
        scene: {},
        request: {
          versionID: 'version-id',
        },
        user: {
          params: {
            userId: 'user-id',
          },
        },
      };

      const handlerManager = new HandlerManager(services as any, null as any);
      handlerManager._extractSlots = sinon.stub().returns({});

      await handlerManager.handle(conv as any);

      expect(services.context.build.args[0]).to.eql([conv.request.versionID, conv.user.params.userId]);
      expect(services.initialize.build.args[0]).to.eql([contextObj, conv]);
      expect(contextObj.variables.set.args).to.eql([[V.TIMESTAMP, Math.floor(clock.now / 1000)]]);
      expect(contextObj.update.callCount).to.eql(1);
      expect(services.response.build.args[0]).to.eql([contextObj, conv]);
    });

    it('stack empty', async () => {
      const contextObj = {
        stack: {
          isEmpty: sinon.stub().returns(true),
        },
        variables: {
          set: sinon.stub(),
        },
        update: sinon.stub(),
      };

      const services = {
        initialize: {
          build: sinon.stub(),
        },
        context: {
          build: sinon.stub().returns(contextObj),
        },
        response: {
          build: sinon.stub(),
        },
      };

      const conv = {
        intent: { name: 'random intent', query: 'input raw' },
        scene: { slots: {} },
        request: {
          versionID: 'version-id',
        },
        user: {
          params: {
            userId: 'user-id',
          },
        },
      };

      const handlerManager = new HandlerManager(services as any, null as any);
      handlerManager._extractSlots = sinon.stub().returns({});

      await handlerManager.handle(conv as any);

      expect(services.context.build.args[0]).to.eql([conv.request.versionID, conv.user.params.userId]);
      expect(services.initialize.build.args[0]).to.eql([contextObj, conv]);
      expect(contextObj.variables.set.args).to.eql([[V.TIMESTAMP, Math.floor(clock.now / 1000)]]);
      expect(contextObj.update.callCount).to.eql(1);
      expect(services.response.build.args[0]).to.eql([contextObj, conv]);
    });

    it('existing session', async () => {
      const contextObj = {
        stack: {
          isEmpty: sinon.stub().returns(false),
        },
        variables: {
          set: sinon.stub(),
        },
        update: sinon.stub(),
        turn: {
          set: sinon.stub(),
        },
      };

      const services = {
        initialize: {
          build: sinon.stub(),
        },
        context: {
          build: sinon.stub().returns(contextObj),
        },
        response: {
          build: sinon.stub(),
        },
      };

      const conv = {
        intent: { name: 'random intent', query: 'input raw' },
        scene: { slots: {} },
        request: {
          versionID: 'version-id',
        },
        user: {
          params: {
            userId: 'user-id',
          },
        },
      };

      const slots = { slot1: 'slot_one', slot2: 'slot_two' };

      const handlerManager = new HandlerManager(services as any, null as any);
      handlerManager._extractSlots = sinon.stub().returns(slots);

      await handlerManager.handle(conv as any);

      expect(services.context.build.args[0]).to.eql([conv.request.versionID, conv.user.params.userId]);
      expect(contextObj.turn.set.args[0]).to.eql([
        T.REQUEST,
        {
          type: RequestType.INTENT,
          payload: {
            intent: conv.intent.name,
            input: conv.intent.query,
            slots,
          },
        },
      ]);
      expect(contextObj.variables.set.args).to.eql([[V.TIMESTAMP, Math.floor(clock.now / 1000)]]);
      expect(contextObj.update.callCount).to.eql(1);
      expect(services.response.build.args[0]).to.eql([contextObj, conv]);
    });
  });
});
