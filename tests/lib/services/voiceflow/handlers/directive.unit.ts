import { expect } from 'chai';
import _ from 'lodash';
import sinon from 'sinon';

import { T } from '@/lib/constants';
import DefaultCardHandler, { DirectiveHandler, DirectiveResponseBuilder } from '@/lib/services/runtime/handlers/directive';

describe('card handler unit tests', async () => {
  afterEach(() => sinon.restore());

  describe('canHandle', () => {
    it('false', async () => {
      const block = {};

      const result = DefaultCardHandler().canHandle(block as any, null as any, null as any, null as any);

      expect(result).to.eql(false);
    });

    it('true', async () => {
      const block = { directive: 'cool' };

      const result = DefaultCardHandler().canHandle(block as any, null as any, null as any, null as any);

      expect(result).to.eql(true);
    });
  });

  describe('handle', () => {
    it('works', async () => {
      const directive = { content: { card: null } };
      const utils = {
        replaceVariables: sinon
          .stub()
          .onFirstCall()
          .returns(JSON.stringify(directive)),
      };

      const directiveHandler = DirectiveHandler(utils);

      const block = {
        directive: 'test',
        nextId: 'next-id',
      };

      const variables = { foo: 'bar' };
      const variableState = { getState: sinon.stub().returns(variables) };
      const runtime = {
        turn: { set: sinon.stub(), get: sinon.stub().returns(undefined) },
        variables: { getVariables: sinon.stub().returns({}) },
        trace: { debug: sinon.stub() },
      };

      const result = directiveHandler.handle(block as any, runtime as any, variableState as any, null as any);

      expect(result).to.eql(block.nextId);
      expect(utils.replaceVariables.args[0]).to.eql([block.directive, variables]);
      expect(runtime.turn.get.args[0]).to.eql([T.DIRECTIVES]);
      expect(runtime.turn.set.args[0]).to.eql([T.DIRECTIVES, [directive]]);
      expect(variableState.getState.args).to.eql([[]]);
      expect(runtime.trace.debug.callCount).to.eql(1);
    });

    it('spreads directives', async () => {
      const existingDirectives = [{ foo: 'bar' }];
      const directive = { content: { card: null } };
      const utils = {
        replaceVariables: sinon
          .stub()
          .onFirstCall()
          .returns(JSON.stringify(directive)),
      };

      const directiveHandler = DirectiveHandler(utils);

      const block = {
        directive: 'test',
        nextId: 'next-id',
      };

      const variables = { foo: 'bar' };
      const variableState = { getState: sinon.stub().returns(variables) };
      const runtime = {
        turn: { set: sinon.stub(), get: sinon.stub().returns(existingDirectives) },
        variables: { getVariables: sinon.stub().returns({}) },
        trace: { debug: sinon.stub() },
      };

      const result = directiveHandler.handle(block as any, runtime as any, variableState as any, null as any);

      expect(result).to.eql(block.nextId);
      expect(utils.replaceVariables.args[0]).to.eql([block.directive, variables]);
      expect(runtime.turn.get.args[0]).to.eql([T.DIRECTIVES]);
      expect(runtime.turn.set.args[0]).to.eql([T.DIRECTIVES, [...existingDirectives, directive]]);
      expect(variableState.getState.args).to.eql([[]]);
      expect(runtime.trace.debug.callCount).to.eql(1);
    });

    it('invalid JSON', async () => {
      const utils = {
        replaceVariables: sinon
          .stub()
          .onFirstCall()
          .returns('not { valid } JSON'),
      };

      const directiveHandler = DirectiveHandler(utils);

      const block = {
        directive: 'test',
        nextId: 'next-id',
      };

      const variables = { foo: 'bar' };
      const variableState = { getState: sinon.stub().returns(variables) };
      const runtime = {
        turn: { set: sinon.stub(), get: sinon.stub().returns(undefined) },
        variables: { getVariables: sinon.stub().returns({}) },
        trace: { debug: sinon.stub() },
      };

      const result = directiveHandler.handle(block as any, runtime as any, variableState as any, null as any);

      expect(result).to.eql(block.nextId);
      expect(utils.replaceVariables.args[0]).to.eql([block.directive, variables]);
      expect(runtime.turn.get.callCount).to.eql(0);
      expect(runtime.turn.set.callCount).to.eql(0);
      expect(variableState.getState.callCount).to.eql(1);
      expect(runtime.trace.debug.callCount).to.eql(1);
    });
  });

  describe('responseBuilder', () => {
    it('invalid directives', async () => {
      const runtime = {
        turn: { get: sinon.stub().returns(null) },
      };

      DirectiveResponseBuilder(runtime as any, null as any);

      expect(runtime.turn.get.args[0]).to.eql([T.DIRECTIVES]);
    });

    it('no directives', async () => {
      const runtime = {
        turn: { get: sinon.stub().returns([]) },
      };
      const conv = { prompt: { content: {} } };

      DirectiveResponseBuilder(runtime as any, conv as any);

      expect(conv.prompt).to.eql(conv.prompt);
      expect(runtime.turn.get.args[0]).to.eql([T.DIRECTIVES]);
    });

    it('merge prompt', async () => {
      const directive1 = {
        canvas: { url: 'foo', data: [], suppressMic: false },
      };
      const runtime = {
        turn: {
          get: sinon.stub().returns([directive1]),
        },
      };
      const conv = { prompt: { content: { card: { title: 'cool' } } } };

      DirectiveResponseBuilder(runtime as any, conv as any);

      expect(conv.prompt).to.eql({
        ...conv.prompt,
        ...directive1,
      });
      expect(runtime.turn.get.args[0]).to.eql([T.DIRECTIVES]);
    });

    it('multiple directives', async () => {
      const directive1 = {
        canvas: { url: 'foo', data: [], suppressMic: false },
      };
      const directive2 = {
        content: { image: { url: 'foobar' } },
      };
      const runtime = {
        turn: {
          get: sinon.stub().returns([directive1, directive2]),
        },
      };
      const content = { card: { title: 'cool' } };
      const conv = { prompt: { content } };

      DirectiveResponseBuilder(runtime as any, conv as any);

      expect(conv.prompt).to.eql({
        ...conv.prompt,
        ...directive1,
        content: {
          ...content,
          ...directive2.content,
        },
      });
      expect(runtime.turn.get.args[0]).to.eql([T.DIRECTIVES]);
    });
  });
});
