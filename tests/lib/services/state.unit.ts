import { expect } from 'chai';
import sinon from 'sinon';

import StateManager from '@/lib/services/state';

describe('stateManager unit tests', async () => {
  afterEach(() => sinon.restore());

  describe('saveToDb', () => {
    it('works correctly', async () => {
      const putPromise = sinon.stub();
      const services = {
        docClient: { put: sinon.stub().returns({ promise: putPromise }) },
      };
      const config = {
        SESSIONS_DYNAMO_TABLE: 'sessions_table',
      };

      const stateManager = new StateManager(services as any, config as any);

      const userId = 'user-id';
      const state = { foo: 'bar' };
      await stateManager.saveToDb(userId, state as any);

      expect(services.docClient.put.args[0]).to.eql([
        {
          TableName: config.SESSIONS_DYNAMO_TABLE,
          Item: {
            id: `${StateManager.GACTION_SESSIONS_DYNAMO_PREFIX}.${userId}`,
            state,
          },
        },
      ]);

      expect(putPromise.callCount).to.eql(1);
    });
  });

  describe('getFromDb', () => {
    it('no userId', async () => {
      const config = {
        SESSIONS_DYNAMO_TABLE: 'session-table',
      };
      const services = {
        docClient: {
          get: sinon.stub(),
        },
      };
      const stateManager = new StateManager(services as any, config as any);

      const userId = null;

      expect(await stateManager.getFromDb(userId as any)).to.eql({});
      expect(services.docClient.get.callCount).to.eql(0);
    });

    it('no state in item', async () => {
      const config = {
        SESSIONS_DYNAMO_TABLE: 'session-table',
      };
      const services = {
        docClient: {
          get: sinon.stub().returns({ promise: sinon.stub().returns({ Item: {} }) }),
        },
      };
      const stateManager = new StateManager(services as any, config as any);

      const userId = '1';

      expect(await stateManager.getFromDb(userId as any)).to.eql({});
      expect(services.docClient.get.callCount).to.eql(1);
    });

    it('no item', async () => {
      const config = {
        SESSIONS_DYNAMO_TABLE: 'session-table',
      };
      const services = {
        docClient: {
          get: sinon.stub().returns({ promise: sinon.stub().returns({}) }),
        },
      };
      const stateManager = new StateManager(services as any, config as any);

      const userId = '1';

      expect(await stateManager.getFromDb(userId as any)).to.eql({});
      expect(services.docClient.get.callCount).to.eql(1);
    });

    it('works correctly', async () => {
      const state = { foo: 'bar' };
      const config = {
        SESSIONS_DYNAMO_TABLE: 'session-table',
      };
      const services = {
        docClient: {
          get: sinon.stub().returns({ promise: sinon.stub().returns({ Item: { state } }) }),
        },
      };
      const stateManager = new StateManager(services as any, config as any);

      const userId = '1';

      expect(await stateManager.getFromDb(userId as any)).to.eql(state);
      expect(services.docClient.get.callCount).to.eql(1);
    });
  });

  describe('contextAdapter', () => {
    it('works', async () => {
      const oldState = {
        last_speak: 'in second flow. say smth to continue',
        sessions: 1,
        reprompt: 0,
        globals: [
          {
            sessions: 1,
            voiceflow: {
              permissions: [],
              events: [],
              capabilities: {
                list: [
                  {
                    name: 'actions.capability.AUDIO_OUTPUT',
                  },
                  {
                    name: 'actions.capability.MEDIA_RESPONSE_AUDIO',
                  },
                  {
                    name: 'actions.capability.SCREEN_OUTPUT',
                  },
                  {
                    name: 'actions.capability.ACCOUNT_LINKING',
                  },
                ],
              },
            },
            locale: 'en-US',
            user_id: 'f1ad99de-d11d-4bda-aa39-0bfeccf218c2',
            platform: 'google',
            timestamp: 1588607977401,
          },
        ],
        transformed_input: null,
        diagrams: [
          {
            output_map: [['homeCounter', 'secondCounter']],
            id: 'chpdRRgsmypGRrVPOVRb0g5B80aPJCv1',
            variable_state: {
              homeCounter: 4,
            },
            commands: {
              stop: {
                diagram_id: 'XNZy6PvjhttVIxbQCGMgzbeVQYxtqkzv',
                mappings: [],
                end: false,
              },
              help: {
                diagram_id: 'SK1f5m6RvqueRYuJHpmYaTgFWoXgcx92',
                mappings: [],
                end: false,
              },
            },
            line: 'ck9so2dv000dc3h5scpdwu8pb',
          },
          {
            variable_state: {
              secondCounter: 6,
            },
            commands: {},
            id: '0Sf0IVfecjYPJgcuWJpiTmdkjW29Yd8r',
          },
        ],
        enteringNewDiagram: false,
        locale: 'en-US',
        line_id: 'ck9so1ue400c03h5s3d5nhvji',
        platform: 'google',
        output: 'in second flow. say smth to continue',
        repeat: 100,
        customer_info: {},
        skill_id: 37,
        end: false,
        alexa_permissions: [],
        oneShotIntent: 'Default Welcome Intent',
        supported_interfaces: {
          list: [
            {
              name: 'actions.capability.AUDIO_OUTPUT',
            },
            {
              name: 'actions.capability.MEDIA_RESPONSE_AUDIO',
            },
            {
              name: 'actions.capability.SCREEN_OUTPUT',
            },
            {
              name: 'actions.capability.ACCOUNT_LINKING',
            },
          ],
        },
        user: 'f1ad99de-d11d-4bda-aa39-0bfeccf218c2',
        timestamp: 1588607977401,
      };

      const newState = {
        stack: [
          {
            blockID: 'ck9so2dv000dc3h5scpdwu8pb',
            variables: {
              homeCounter: 4,
            },
            storage: {},
            diagramID: 'chpdRRgsmypGRrVPOVRb0g5B80aPJCv1',
            commands: [
              {
                diagram_id: 'XNZy6PvjhttVIxbQCGMgzbeVQYxtqkzv',
                mappings: [],
                end: false,
                intent: 'stop',
              },
              {
                diagram_id: 'SK1f5m6RvqueRYuJHpmYaTgFWoXgcx92',
                mappings: [],
                end: false,
                intent: 'help',
              },
            ],
          },
          {
            blockID: 'ck9so1ue400c03h5s3d5nhvji',
            variables: {
              secondCounter: 6,
            },
            storage: {
              outputMap: [['homeCounter', 'secondCounter']],
              speak: 'in second flow. say smth to continue',
            },
            diagramID: '0Sf0IVfecjYPJgcuWJpiTmdkjW29Yd8r',
            commands: [],
          },
        ],
        variables: {
          sessions: 1,
          voiceflow: {
            events: [],
          },
          locale: 'en-US',
          user_id: 'f1ad99de-d11d-4bda-aa39-0bfeccf218c2',
          platform: 'google',
          timestamp: 1588607977401,
        },
        storage: {
          output: 'in second flow. say smth to continue',
          sessions: 1,
          locale: 'en-US',
          user: 'f1ad99de-d11d-4bda-aa39-0bfeccf218c2',
          repeat: 100,
        },
      };

      const state = new StateManager(null as any, null as any);

      expect(await state.contextAdapter(oldState)).to.eql(newState);
    });
  });
});
