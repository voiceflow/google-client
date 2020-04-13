import { expect } from 'chai';
import sinon from 'sinon';

import { F, S, T } from '@/lib/constants';
import DefaultStreamHandler, { StreamHandler, StreamResponseBuilder, StreamResponseBuilderGenerator } from '@/lib/services/voiceflow/handlers/stream';

describe('stream handler unit tests', async () => {
  afterEach(() => sinon.restore());

  describe('canHandle', () => {
    it('false', async () => {
      const block = {};

      const result = DefaultStreamHandler().canHandle(block as any, null as any, null as any, null as any);

      expect(result).to.eql(false);
    });

    it('true', async () => {
      const block = { play: { foo: 'bar' } };

      const result = DefaultStreamHandler().canHandle(block as any, null as any, null as any, null as any);

      expect(result).to.eql(true);
    });
  });

  describe('handle', () => {
    it('no url but gNextId', async () => {
      const utils = {
        regexVariables: sinon.stub().returns(null),
      };

      const streamHandler = StreamHandler(utils as any);

      const varState = { foo: 'bar' };
      const variables = { getState: sinon.stub().returns(varState) };

      const block = { play: 'random-url', gNextId: 'next-id' };

      expect(streamHandler.handle(block as any, null as any, variables as any, null as any)).to.eql(block.gNextId);
      expect(variables.getState.callCount).to.eql(1);
      expect(utils.regexVariables.args).to.eql([[block.play, varState]]);
    });

    describe('has url', () => {
      it('with gNextId', async () => {
        const regexVariables = sinon.stub();
        const audioUrl = 'audio-url';
        regexVariables.onFirstCall().returns(audioUrl);
        const streamTitle = 'stream-title';
        regexVariables.onSecondCall().returns(streamTitle);
        const description = 'description';
        regexVariables.onThirdCall().returns(description);
        const iconImg = 'icon-img';
        regexVariables.onCall(3).returns(iconImg);
        const backgroundImg = 'background-img';
        regexVariables.onCall(4).returns(backgroundImg);

        const utils = {
          regexVariables,
          addChipsIfExists: sinon.stub(),
        };

        const streamHandler = StreamHandler(utils as any);

        const varState = { foo: 'bar' };
        const variables = { getState: sinon.stub().returns(varState) };
        const topFrame = {
          setBlockID: sinon.stub(),
          storage: {
            delete: sinon.stub(),
          },
        };
        const context = {
          turn: {
            set: sinon.stub(),
          },
          storage: {
            produce: sinon.stub(),
          },
          end: sinon.stub(),
          stack: {
            top: sinon.stub().returns(topFrame),
          },
        };

        const block = {
          play: 'random-url',
          title: 'title',
          description: 'description',
          icon_img: 'iconImg',
          background_img: 'backgroundImg',
          gNextId: 'next-id',
        };

        expect(streamHandler.handle(block as any, context as any, variables as any, null as any)).to.eql(null);
        expect(variables.getState.callCount).to.eql(1);
        expect(utils.regexVariables.args).to.eql([
          [block.play, varState],
          [block.title, varState],
          [block.description, varState],
          [block.icon_img, varState],
          [block.background_img, varState],
        ]);
        expect(context.turn.set.args).to.eql([
          [
            T.STREAM_PLAY,
            {
              url: audioUrl,
              title: streamTitle,
              description,
              icon_img: iconImg,
              background_img: backgroundImg,
            },
          ],
        ]);
        expect(utils.addChipsIfExists.args).to.eql([[block, context, variables]]);
        expect(topFrame.storage.delete.args).to.eql([[F.SPEAK]]);
        expect(topFrame.setBlockID.args).to.eql([[block.gNextId]]);
        expect(context.end.callCount).to.eql(1);
      });

      it('without gNextId', async () => {
        const utils = {
          regexVariables: sinon.stub().returns('random-string'),
          addChipsIfExists: sinon.stub(),
        };

        const streamHandler = StreamHandler(utils as any);

        const variables = { getState: sinon.stub().returns({ foo: 'bar' }) };
        const context = {
          turn: {
            set: sinon.stub(),
          },
          storage: {
            produce: sinon.stub(),
          },
          end: sinon.stub(),
        };

        const block = {
          play: 'random-url',
        };

        expect(streamHandler.handle(block as any, context as any, variables as any, null as any)).to.eql(null);
        expect(context.turn.set.args[1]).to.eql([T.END, true]);
      });

      describe('produce', () => {
        it('no output', async () => {
          const regexVariables = sinon.stub().returns('random-string');
          regexVariables.onCall(1).returns(null);

          const utils = {
            regexVariables,
            addChipsIfExists: sinon.stub(),
          };

          const streamHandler = StreamHandler(utils as any);

          const variables = { getState: sinon.stub().returns({ foo: 'bar' }) };
          const context = {
            turn: {
              set: sinon.stub(),
            },
            storage: {
              produce: sinon.stub(),
            },
            end: sinon.stub(),
          };

          const block = {
            play: 'random-url',
          };

          streamHandler.handle(block as any, context as any, variables as any, null as any);

          const fn = context.storage.produce.args[0][0];
          const draft = {
            [S.OUTPUT]: '   ',
          };

          fn(draft);

          expect(draft[S.OUTPUT]).to.eql('Now Playing Media');
        });

        it('no but stream output', async () => {
          const regexVariablesOutput = 'random-string';

          const utils = {
            regexVariables: sinon.stub().returns(regexVariablesOutput),
            addChipsIfExists: sinon.stub(),
          };

          const streamHandler = StreamHandler(utils as any);

          const variables = { getState: sinon.stub().returns({ foo: 'bar' }) };
          const context = {
            turn: {
              set: sinon.stub(),
            },
            storage: {
              produce: sinon.stub(),
            },
            end: sinon.stub(),
          };

          const block = {
            play: 'random-url',
          };

          streamHandler.handle(block as any, context as any, variables as any, null as any);

          const fn = context.storage.produce.args[0][0];
          const draft = {
            [S.OUTPUT]: '   ',
          };

          fn(draft);

          expect(draft[S.OUTPUT]).to.eql(`Now Playing ${regexVariablesOutput}`);
        });

        it('output', () => {
          const regexVariablesOutput = 'random-string';

          const utils = {
            regexVariables: sinon.stub().returns(regexVariablesOutput),
            addChipsIfExists: sinon.stub(),
          };

          const streamHandler = StreamHandler(utils as any);

          const variables = { getState: sinon.stub().returns({ foo: 'bar' }) };
          const context = {
            turn: {
              set: sinon.stub(),
            },
            storage: {
              produce: sinon.stub(),
            },
            end: sinon.stub(),
          };

          const block = {
            play: 'random-url',
          };

          streamHandler.handle(block as any, context as any, variables as any, null as any);

          const fn = context.storage.produce.args[0][0];
          const draft = {
            [S.OUTPUT]: 'here',
          };

          fn(draft);

          expect(draft[S.OUTPUT]).to.eql('here');
        });
      });
    });
  });

  describe('responseBuilder', () => {
    it('no card', async () => {
      const context = {
        turn: { get: sinon.stub().returns(null) },
      };

      StreamResponseBuilder(context as any, null as any);

      expect(context.turn.get.args[0]).to.eql([T.STREAM_PLAY]);
    });

    it('no capabilities', () => {
      const context = {
        turn: { get: sinon.stub().returns({}) },
      };

      const conv = { surface: { capabilities: { has: sinon.stub().returns(false) } }, add: sinon.stub() };

      StreamResponseBuilder(context as any, conv as any);

      expect(context.turn.get.args[0]).to.eql([T.STREAM_PLAY]);
      expect(conv.surface.capabilities.has.callCount).to.eql(1);
      expect(conv.add.args).to.eql([['Sorry, this device does not support audio playback.']]);
    });

    describe('has capabilities', () => {
      it('no background or icon', () => {
        const MediaObjectBuilder = sinon.stub();

        const streamResponseBuilder = StreamResponseBuilderGenerator(null as any, MediaObjectBuilder as any, null as any);

        const play = { title: 'title', description: 'description', icon_img: null, background_img: null, url: 'url' };

        const turnGet = sinon.stub().returns(true);
        turnGet.onCall(0).returns(play);

        const context = {
          turn: { get: turnGet },
        };

        const conv = { surface: { capabilities: { has: sinon.stub().returns(true) } }, add: sinon.stub() };

        streamResponseBuilder(context as any, conv as any);

        expect(MediaObjectBuilder.args).to.eql([[{ name: play.title, url: play.url, description: play.description }]]);
        expect(conv.add.args).to.eql([[{}]]);
      });

      it('background but no icon', () => {
        const ImageBuilder = sinon.stub();
        const MediaObjectBuilder = sinon.stub();

        const streamResponseBuilder = StreamResponseBuilderGenerator(ImageBuilder as any, MediaObjectBuilder as any, null as any);

        const play = { title: 'title', description: 'description', icon_img: null, background_img: 'background', url: 'url' };

        const turnGet = sinon.stub().returns(true);
        turnGet.onCall(0).returns(play);

        const context = {
          turn: { get: turnGet },
        };

        const conv = { surface: { capabilities: { has: sinon.stub().returns(true) } }, add: sinon.stub() };

        streamResponseBuilder(context as any, conv as any);

        expect(ImageBuilder.args).to.eql([[{ url: play.background_img, alt: 'Media Background Image' }]]);
        expect(MediaObjectBuilder.args).to.eql([[{ name: play.title, url: play.url, description: play.description, image: {} }]]);
      });

      it('icon but no background', () => {
        const ImageBuilder = sinon.stub();
        const MediaObjectBuilder = sinon.stub();

        const streamResponseBuilder = StreamResponseBuilderGenerator(ImageBuilder as any, MediaObjectBuilder as any, null as any);

        const play = { title: 'title', description: 'description', icon_img: 'icon', background_img: null, url: 'url' };

        const turnGet = sinon.stub().returns(false);
        turnGet.onCall(0).returns(play);
        turnGet.onCall(2).returns(true);

        const context = {
          turn: { get: turnGet },
        };

        const conv = { surface: { capabilities: { has: sinon.stub().returns(true) } }, add: sinon.stub() };

        streamResponseBuilder(context as any, conv as any);

        expect(ImageBuilder.args).to.eql([[{ url: play.icon_img, alt: 'Media Icon Image' }]]);
        expect(MediaObjectBuilder.args).to.eql([[{ name: play.title, url: play.url, description: play.description, icon: {} }]]);
      });

      it('with suggestions', () => {
        const SuggestionsBuilder = sinon.stub();
        const MediaObjectBuilder = sinon.stub();

        const streamResponseBuilder = StreamResponseBuilderGenerator(null as any, MediaObjectBuilder as any, SuggestionsBuilder as any);

        const play = { title: 'title', description: 'description', icon_img: null, background_img: null, url: 'url' };

        const turnGet = sinon.stub().returns(false);
        turnGet.onCall(0).returns(play);

        const context = {
          turn: { get: turnGet },
        };

        const conv = { surface: { capabilities: { has: sinon.stub().returns(true) } }, add: sinon.stub() };

        streamResponseBuilder(context as any, conv as any);

        expect(SuggestionsBuilder.args).to.eql([[['continue', 'exit']]]);
        expect(conv.add.callCount).to.eql(2);
      });
    });
  });
});
