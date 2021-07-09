import { NodeType } from '@voiceflow/google-types/build/nodes/df-es/types';
import { expect } from 'chai';
import sinon from 'sinon';

import { T } from '@/lib/constants';
import DefaultPayloadHandler, { PayloadHandler, PayloadResponseBuilderDialogflowES } from '@/lib/services/runtime/handlers/df-es/payload';

describe('df es payload handler unit tests', async () => {
  afterEach(() => sinon.restore());

  describe('canHandle', () => {
    it('false', async () => {
      expect(DefaultPayloadHandler().canHandle({} as any, null as any, null as any, null as any)).to.eql(false);
    });

    it('true', async () => {
      expect(DefaultPayloadHandler().canHandle({ type: NodeType.PAYLOAD } as any, null as any, null as any, null as any)).to.eql(true);
    });
  });

  describe('handle', () => {
    it('throws', async () => {
      const utils = {
        addVariables: sinon.stub().returns(''),
      };

      const payloadHandler = PayloadHandler(utils);

      const block = {
        data: '{var}',
        nextID: 'next-id',
      };
      const runtime = {
        trace: { debug: sinon.stub() },
      };
      const variables = { foo: 'bar' };

      expect(payloadHandler.handle(block as any, runtime as any, variables as any, null as any)).to.eql(block.nextID);

      expect(utils.addVariables.args).to.eql([[block.data, variables]]);
      expect(runtime.trace.debug.args).to.eql([['invalid payload JSON:\n``\n`SyntaxError: Unexpected end of JSON input`']]);
    });

    it('works', async () => {
      const utils = {
        addVariables: sinon.stub().returns('{"a": "b"}'),
      };

      const payloadHandler = PayloadHandler(utils);

      const block = {
        data: '{"a": "b"}',
        nextID: 'next-id',
      };
      const runtime = {
        turn: { set: sinon.stub() },
      };
      const variables = { foo: 'bar' };

      expect(payloadHandler.handle(block as any, runtime as any, variables as any, null as any)).to.eql(block.nextID);

      expect(utils.addVariables.args).to.eql([[block.data, variables]]);
      expect(runtime.turn.set.args).to.eql([[T.DF_ES_PAYLOAD, { data: JSON.parse(block.data) }]]);
    });
  });

  describe('responseBuilderDialogflowES', () => {
    it('no payload', async () => {
      const runtime = {
        turn: { get: sinon.stub().returns(null) },
      };

      PayloadResponseBuilderDialogflowES(runtime as any, null as any);

      expect(runtime.turn.get.args).to.eql([[T.DF_ES_PAYLOAD]]);
    });

    it('with payload', async () => {
      const data = { a: 'b' };
      const payload = {
        data,
      };

      const runtime = {
        turn: { get: sinon.stub().returns(payload) },
      };

      const res = { fulfillmentMessages: [] };

      PayloadResponseBuilderDialogflowES(runtime as any, res as any);

      expect(runtime.turn.get.args).to.eql([[T.DF_ES_PAYLOAD]]);
      expect(res.fulfillmentMessages).to.eql([
        {
          payload: data,
        },
      ]);
    });
  });
});
