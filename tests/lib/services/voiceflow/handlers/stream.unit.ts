import { expect } from 'chai';
import sinon from 'sinon';

import { F, S, T } from '@/lib/constants';
import DefaultStreamHandler, {
  StreamHandler,
  StreamResponseBuilder,
  StreamResponseBuilderGenerator,
  StreamResponseBuilderGeneratorV2,
  StreamResponseBuilderV2,
} from '@/lib/services/voiceflow/handlers/stream';

describe('stream handler unit tests', async () => {
  afterEach(() => sinon.restore());

  describe('canHandle', () => {
    it('false', async () => {
      const block = {};

      const result = DefaultStreamHandler().canHandle(block as any, null as any, null as any, null as any);

      expect(result).to.eql(false);
    });

    it('true', async () => {
      const block = { play: 'play' };

      const result = DefaultStreamHandler().canHandle(block as any, null as any, null as any, null as any);

      expect(result).to.eql(true);
    });
  });

  describe('handle', () => {
    it('no url but gNextId', async () => {
      const utils = {
        replaceVariables: sinon.stub().returns(null),
      };

      const streamHandler = StreamHandler(utils as any);

      const varState = { foo: 'bar' };
      const variables = { getState: sinon.stub().returns(varState) };

      const block = { play: 'random-url', gNextId: 'next-id' };

      expect(streamHandler.handle(block as any, null as any, variables as any, null as any)).to.eql(block.gNextId);
      expect(variables.getState.callCount).to.eql(1);
      expect(utils.replaceVariables.args).to.eql([[block.play, varState]]);
    });

    describe('has url', () => {
      it('with gNextId', async () => {
        const replaceVariables = sinon.stub();
        const audioUrl = 'audio-url';
        replaceVariables.onFirstCall().returns(audioUrl);
        const streamTitle = 'stream-title';
        replaceVariables.onSecondCall().returns(streamTitle);
        const description = 'description';
        replaceVariables.onThirdCall().returns(description);
        const iconImg = 'icon-img';
        replaceVariables.onCall(3).returns(iconImg);
        const backgroundImg = 'background-img';
        replaceVariables.onCall(4).returns(backgroundImg);

        const utils = {
          replaceVariables,
          addChipsIfExists: sinon.stub(),
        };

        const streamHandler = StreamHandler(utils as any);

        const varState = { foo: 'bar' };
        const variables = { getState: sinon.stub().returns(varState) };
        const topFrame = {
          setNodeID: sinon.stub(),
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
        expect(utils.replaceVariables.args).to.eql([
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
        expect(topFrame.storage.delete.args).to.eql([[F.SPEAK]]);
        expect(topFrame.setNodeID.args).to.eql([[block.gNextId]]);
        expect(context.end.callCount).to.eql(1);
      });

      it('without gNextId', async () => {
        const utils = {
          replaceVariables: sinon.stub().returns('random-string'),
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
          const replaceVariables = sinon.stub().returns('random-string');
          replaceVariables.onCall(1).returns(null);

          const utils = {
            replaceVariables,
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
          const replaceVariablesOutput = 'random-string';

          const utils = {
            replaceVariables: sinon.stub().returns(replaceVariablesOutput),
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

          expect(draft[S.OUTPUT]).to.eql(`Now Playing ${replaceVariablesOutput}`);
        });

        it('output', () => {
          const replaceVariablesOutput = 'random-string';

          const utils = {
            replaceVariables: sinon.stub().returns(replaceVariablesOutput),
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

  describe('responseBuilderV2', () => {
    it('no card', async () => {
      const context = {
        turn: { get: sinon.stub().returns(null) },
      };

      StreamResponseBuilderV2(context as any, null as any);

      expect(context.turn.get.args[0]).to.eql([T.STREAM_PLAY]);
    });

    it('no capabilities', () => {
      const context = {
        turn: { get: sinon.stub().returns({}) },
      };

      const conv = { device: { capabilities: { includes: sinon.stub().returns(false) } }, add: sinon.stub() };

      StreamResponseBuilderV2(context as any, conv as any);

      expect(context.turn.get.args[0]).to.eql([T.STREAM_PLAY]);
      expect(conv.device.capabilities.includes.callCount).to.eql(1);
      expect(conv.add.args).to.eql([['Sorry, this device does not support audio playback.']]);
    });

    describe('has capabilities', () => {
      it('no background or icon', () => {
        const MediaObjectBuilder = sinon.stub();

        const streamResponseBuilder = StreamResponseBuilderGeneratorV2(null as any, MediaObjectBuilder as any, null as any);

        const play = { title: 'title', description: 'description', icon_img: null, background_img: null, url: 'url' };

        const turnGet = sinon.stub().returns(true);
        turnGet.onCall(0).returns(play);

        const context = {
          turn: { get: turnGet },
        };

        const conv = { device: { capabilities: { includes: sinon.stub().returns(true) } }, add: sinon.stub() };

        streamResponseBuilder(context as any, conv as any);

        const mediaObject = { name: play.title, description: play.description, url: play.url, image: { icon: undefined, large: undefined } };
        expect(MediaObjectBuilder.args).to.eql([[{ mediaObjects: [mediaObject], mediaType: 'AUDIO', optionalMediaControls: ['PAUSED', 'STOPPED'] }]]);
        expect(conv.add.args).to.eql([[{}]]);
      });

      it('background but no icon', () => {
        const ImageBuilder = sinon.stub();
        const MediaObjectBuilder = sinon.stub();

        const streamResponseBuilder = StreamResponseBuilderGeneratorV2(ImageBuilder as any, MediaObjectBuilder as any, null as any);

        const play = { title: 'title', description: 'description', icon_img: null, background_img: 'background', url: 'url' };

        const turnGet = sinon.stub().returns(true);
        turnGet.onCall(0).returns(play);

        const context = {
          turn: { get: turnGet },
        };

        const conv = { device: { capabilities: { includes: sinon.stub().returns(true) } }, add: sinon.stub() };

        streamResponseBuilder(context as any, conv as any);

        expect(ImageBuilder.args).to.eql([[{ url: play.background_img, alt: 'Media Background Image' }]]);
        const mediaObject = { name: play.title, description: play.description, url: play.url, image: { icon: undefined, large: {} } };
        expect(MediaObjectBuilder.args).to.eql([[{ mediaObjects: [mediaObject], mediaType: 'AUDIO', optionalMediaControls: ['PAUSED', 'STOPPED'] }]]);
      });

      it('icon but no background', () => {
        const ImageBuilder = sinon.stub();
        const MediaObjectBuilder = sinon.stub();

        const streamResponseBuilder = StreamResponseBuilderGeneratorV2(ImageBuilder as any, MediaObjectBuilder as any, null as any);

        const play = { title: 'title', description: 'description', icon_img: 'icon', background_img: null, url: 'url' };

        const turnGet = sinon.stub().returns(false);
        turnGet.onCall(0).returns(play);
        turnGet.onCall(2).returns(true);

        const context = {
          turn: { get: turnGet },
        };

        const conv = { device: { capabilities: { includes: sinon.stub().returns(true) } }, add: sinon.stub() };

        streamResponseBuilder(context as any, conv as any);

        expect(ImageBuilder.args).to.eql([[{ url: play.icon_img, alt: 'Media Icon Image' }]]);
        const mediaObject = { name: play.title, description: play.description, url: play.url, image: { icon: {}, large: undefined } };
        expect(MediaObjectBuilder.args).to.eql([[{ mediaObjects: [mediaObject], mediaType: 'AUDIO', optionalMediaControls: ['PAUSED', 'STOPPED'] }]]);
      });

      it('with suggestions', () => {
        const SuggestionsBuilder = sinon.stub();
        const MediaObjectBuilder = sinon.stub();

        const streamResponseBuilder = StreamResponseBuilderGeneratorV2(null as any, MediaObjectBuilder as any, SuggestionsBuilder as any);

        const play = { title: 'title', description: 'description', icon_img: null, background_img: null, url: 'url' };

        const turnGet = sinon.stub().returns(false);
        turnGet.onCall(0).returns(play);

        const context = {
          turn: { get: turnGet },
        };

        const conv = { device: { capabilities: { includes: sinon.stub().returns(true) } }, add: sinon.stub() };

        streamResponseBuilder(context as any, conv as any);

        expect(SuggestionsBuilder.args).to.eql([[{ title: 'continue' }], [{ title: 'exit' }]]);
        expect(conv.add.callCount).to.eql(3);
      });
    });
  });
});
