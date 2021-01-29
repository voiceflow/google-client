import { expect } from 'chai';
import sinon from 'sinon';

import { S, T } from '@/lib/constants';
import { addChipsIfExistsV1, addRepromptIfExists, mapSlots, transformDateTimeVariableToString } from '@/lib/services/runtime/utils';

describe('runtime manager utils unit tests', async () => {
  afterEach(() => sinon.restore());

  describe('addRepromptIfExists', () => {
    it('does not have repropmt', () => {
      const runtime = { turn: { set: sinon.stub() } };
      addRepromptIfExists({ foo: 'bar' } as any, runtime as any, null as any);

      expect(runtime.turn.set.callCount).to.eql(0);
    });

    it('has reprompt', () => {
      const runtime = { storage: { set: sinon.stub() } };
      const block = { reprompt: 'hello {var}' };
      const varState = { var: 'there' };
      const variables = { getState: sinon.stub().returns(varState) };

      addRepromptIfExists(block as any, runtime as any, variables as any);

      expect(runtime.storage.set.args[0]).to.eql([S.REPROMPT, 'hello there']);
    });
  });

  describe('addChipsIfExists', () => {
    it('does not have chips', () => {
      const runtime = { turn: { set: sinon.stub() } };
      addChipsIfExistsV1({ foo: 'bar' } as any, runtime as any, null as any);

      expect(runtime.turn.set.callCount).to.eql(0);
    });

    it('has reprompt', () => {
      const runtime = { turn: { set: sinon.stub() } };
      const block = { chips: ['hello {var}', 'hi {var2}'] };
      const varState = { var: 'world', var2: 'there' };
      const variables = { getState: sinon.stub().returns(varState) };

      addChipsIfExistsV1(block as any, runtime as any, variables as any);

      expect(runtime.turn.set.args[0]).to.eql([T.CHIPS, ['hello world', 'hi there']]);
    });
  });

  describe('transformDateTimeVariableToString', () => {
    // not datetime
    expect(transformDateTimeVariableToString({ foo: 'bar' } as any)).to.eql('');
    // datetime
    expect(transformDateTimeVariableToString({ day: 1, month: 2, year: 2020, hours: 13, minutes: 15, seconds: 0, nanos: 0 })).to.eql(
      '1/2/2020 13:15'
    );
    // time
    expect(transformDateTimeVariableToString({ hours: 13, minutes: 15, seconds: 0 } as any)).to.eql('13:15');
    // date
    expect(transformDateTimeVariableToString({ day: 1, month: 2, year: 2020, hours: 13 } as any)).to.eql('1/2/2020 13:00');
  });

  describe('mapSlots', () => {
    it('no mappings', () => {
      expect(mapSlots(null as any, { foo: 'bar' } as any)).to.eql({});
    });

    it('no slots', () => {
      expect(mapSlots({ foo: 'bar' } as any, null as any)).to.eql({});
    });

    it('no mappings and slots', () => {
      expect(mapSlots(null as any, null as any)).to.eql({});
    });

    it('works', () => {
      const mappings = [
        { slot: 'slotA', variable: 'var1' },
        {},
        { slot: 'slotB', variable: 'var2' },
        { slot: 'randomSlot', variable: 'var3' },
        { slot: 'slotC', variable: 'var3' },
      ];
      const slots = { slotA: '1', slotB: 'value', slotC: { day: 1, month: 2, year: 2020, hours: 13, minutes: 15, seconds: 0, nanos: 0 } };

      expect(mapSlots(mappings as any, slots as any)).to.eql({ var1: 1, var2: 'value', var3: '1/2/2020 13:15' });
    });
  });
});
