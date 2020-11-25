import { expect } from 'chai';
import sinon from 'sinon';

import StateManager from '@/lib/services/state/mongo';

describe('mongo stateManager unit tests', async () => {
  afterEach(() => sinon.restore());

  it('enabled', () => {
    expect(StateManager.enabled({ SESSIONS_SOURCE: 'mongo' } as any)).to.eql(true);
    expect(StateManager.enabled({ SESSIONS_SOURCE: 'dynamo' } as any)).to.eql(false);
  });

  describe('saveToDb', () => {
    it('throws', async () => {
      const updateOne = sinon.stub().resolves({ result: { ok: false } });
      const state = new StateManager({ mongo: { db: { collection: sinon.stub().returns({ updateOne }) } } } as any, {} as any);

      await expect(state.saveToDb('user-id', { foo: 'bar' } as any)).to.eventually.rejectedWith('store runtime session error');
    });

    it('works', async () => {
      const updateOne = sinon.stub().resolves({ result: { ok: true } });
      const state = new StateManager({ mongo: { db: { collection: sinon.stub().returns({ updateOne }) } } } as any, {} as any);

      const userID = 'user-id';
      const stateObj = { foo: 'bar' };
      await state.saveToDb(userID, stateObj as any);

      const id = `${StateManager.GACTION_SESSIONS_DYNAMO_PREFIX}.${userID}`;
      expect(updateOne.args).to.eql([[{ id }, { $set: { id, attributes: stateObj } }, { upsert: true }]]);
    });
  });

  describe('getFromDb', () => {
    it('no user id', async () => {
      const state = new StateManager({ mongo: {} } as any, {} as any);

      expect(await state.getFromDb(null as any)).to.eql({});
    });

    it('not found', async () => {
      const findOne = sinon.stub().resolves(null);
      const state = new StateManager({ mongo: { db: { collection: sinon.stub().returns({ findOne }) } } } as any, {} as any);

      expect(await state.getFromDb('user-id')).to.eql({});
    });

    it('works', async () => {
      const attributes = { foo: 'bar' };
      const findOne = sinon.stub().resolves({ attributes });
      const state = new StateManager({ mongo: { db: { collection: sinon.stub().returns({ findOne }) } } } as any, {} as any);

      expect(await state.getFromDb('user-id')).to.eql(attributes);
    });
  });
});
