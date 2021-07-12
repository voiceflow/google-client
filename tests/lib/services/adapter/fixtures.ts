// fixtures generated by running vf-server and google service.

// malformed
export const oldMalformed = {};
export const newMalformed = {};

// randoms
export const oldRandoms = {
  globals: [
    {
      sessions: 1,
      voiceflow: {
        permissions: [],
        events: [],
        capabilities: {
          list: [
            {
              name: 'actions.capability.MEDIA_RESPONSE_AUDIO',
            },
            {
              name: 'actions.capability.AUDIO_OUTPUT',
            },
            {
              name: 'actions.capability.ACCOUNT_LINKING',
            },
            {
              name: 'actions.capability.SCREEN_OUTPUT',
            },
          ],
        },
      },
      locale: 'en-US',
      user_id: 'f1ad99de-d11d-4bda-aa39-0bfeccf218c2',
      platform: 'google',
      timestamp: 1588773016,
    },
  ],
  transformed_input: null,
  diagrams: [],
  enteringNewDiagram: false,
  locale: 'en-US',
  line_id: null,
  platform: 'google',
  output: 'finish',
  pop: {
    variable_state: {},
    commands: {},
    id: 'QnMwsLnElKO2MnBteH7n7fMt3q94SqoL',
  },
  repeat: 100,
  randoms: {
    ck9vee27700063h5sg24qb4xy: ['ck9vee820000l3h5sxpy0xbac'],
  },
  customer_info: {},
  end: true,
  alexa_permissions: [],
  supported_interfaces: {
    list: [
      {
        name: 'actions.capability.MEDIA_RESPONSE_AUDIO',
      },
      {
        name: 'actions.capability.AUDIO_OUTPUT',
      },
      {
        name: 'actions.capability.ACCOUNT_LINKING',
      },
      {
        name: 'actions.capability.SCREEN_OUTPUT',
      },
    ],
  },
  timestamp: 1588773016438,
  last_speak: 'finish',
  sessions: 1,
  reprompt: 0,
  intent: null,
  ending: true,
  slots: {},
  skill_id: 26,
  oneShotIntent: 'Default Welcome Intent',
  user: 'f1ad99de-d11d-4bda-aa39-0bfeccf218c2',
};

export const newRandoms = {
  stack: [],
  variables: {
    sessions: 1,
    voiceflow: {
      permissions: [],
      events: [],
      capabilities: {
        list: [
          {
            name: 'actions.capability.MEDIA_RESPONSE_AUDIO',
          },
          {
            name: 'actions.capability.AUDIO_OUTPUT',
          },
          {
            name: 'actions.capability.ACCOUNT_LINKING',
          },
          {
            name: 'actions.capability.SCREEN_OUTPUT',
          },
        ],
      },
    },
    locale: 'en-US',
    user_id: 'f1ad99de-d11d-4bda-aa39-0bfeccf218c2',
    platform: 'google',
    timestamp: 1588773016,
  },
  storage: {
    output: 'finish',
    randoms: {
      ck9vee27700063h5sg24qb4xy: ['ck9vee820000l3h5sxpy0xbac'],
    },
    sessions: 1,
    locale: 'en-US',
    user: 'f1ad99de-d11d-4bda-aa39-0bfeccf218c2',
    repeat: 100,
  },
};

// no diagrams and globals[0]. missing attributes from old
export const oldMissing = {
  globals: [],
  transformed_input: null,
  enteringNewDiagram: false,
  locale: 'en-US',
  line_id: null,
  platform: 'google',
  output: 'finish',
  pop: {
    variable_state: {},
    commands: {},
    id: 'QnMwsLnElKO2MnBteH7n7fMt3q94SqoL',
  },
  repeat: 100,
  randoms: {
    ck9vee27700063h5sg24qb4xy: ['ck9vee820000l3h5sxpy0xbac'],
  },
  customer_info: {},
  end: true,
  alexa_permissions: [],
  supported_interfaces: {
    list: [
      {
        name: 'actions.capability.MEDIA_RESPONSE_AUDIO',
      },
      {
        name: 'actions.capability.AUDIO_OUTPUT',
      },
      {
        name: 'actions.capability.ACCOUNT_LINKING',
      },
      {
        name: 'actions.capability.SCREEN_OUTPUT',
      },
    ],
  },
  timestamp: 1588773016438,
  last_speak: 'finish',
  sessions: 1,
  reprompt: 0,
  intent: null,
  ending: true,
  slots: {},
  skill_id: 26,
  oneShotIntent: 'Default Welcome Intent',
  user: 'f1ad99de-d11d-4bda-aa39-0bfeccf218c2',
};

export const newMissing = {
  stack: [],
  variables: {
    voiceflow: {
      events: [],
    },
  },
  storage: {
    output: 'finish',
    randoms: {
      ck9vee27700063h5sg24qb4xy: ['ck9vee820000l3h5sxpy0xbac'],
    },
    sessions: 1,
    locale: 'en-US',
    user: 'f1ad99de-d11d-4bda-aa39-0bfeccf218c2',
    repeat: 100,
  },
};

// state containing outputMap
export const oldOutputMap = {
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
        },
        help: {
          diagram_id: 'SK1f5m6RvqueRYuJHpmYaTgFWoXgcx92',
          mappings: [],
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

export const newOutputMap = {
  stack: [
    {
      nodeID: 'ck9so2dv000dc3h5scpdwu8pb',
      variables: {
        homeCounter: 4,
      },
      storage: {},
      programID: 'chpdRRgsmypGRrVPOVRb0g5B80aPJCv1',
      commands: [
        {
          diagram_id: 'XNZy6PvjhttVIxbQCGMgzbeVQYxtqkzv',
          mappings: [],
          intent: 'stop',
        },
        {
          diagram_id: 'SK1f5m6RvqueRYuJHpmYaTgFWoXgcx92',
          mappings: [],
          intent: 'help',
        },
      ],
    },
    {
      nodeID: 'ck9so1ue400c03h5s3d5nhvji',
      variables: {
        secondCounter: 6,
      },
      storage: {
        outputMap: [['homeCounter', 'secondCounter']],
        speak: 'in second flow. say smth to continue',
      },
      programID: '0Sf0IVfecjYPJgcuWJpiTmdkjW29Yd8r',
      commands: [],
    },
  ],
  variables: {
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
  storage: {
    output: 'in second flow. say smth to continue',
    sessions: 1,
    locale: 'en-US',
    user: 'f1ad99de-d11d-4bda-aa39-0bfeccf218c2',
    repeat: 100,
  },
};

// state containing local variables
export const oldDiagramsVariables = {
  last_speak: 'say smth',
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
              name: 'actions.capability.MEDIA_RESPONSE_AUDIO',
            },
            {
              name: 'actions.capability.AUDIO_OUTPUT',
            },
            {
              name: 'actions.capability.ACCOUNT_LINKING',
            },
            {
              name: 'actions.capability.SCREEN_OUTPUT',
            },
          ],
        },
      },
      locale: 'en-US',
      user_id: 'f1ad99de-d11d-4bda-aa39-0bfeccf218c2',
      platform: 'google',
      timestamp: 1588686113,
    },
  ],
  transformed_input: null,
  diagrams: [
    {
      output_map: [['homeCounter', 'secondCounter']],
      id: 'F9QGfXDrhLZDJ1EYhg7c1KxxApAiVyD6',
      variable_state: {
        homeCounter: 1,
      },
      commands: {},
      line: 'ck9tyj3yx00943h5s629xvnda',
    },
    {
      output_map: [['secondCounter', 'thirdCounter']],
      id: 'GXCNwfzhsxEXN9TfKVi6N98SqDCvb5HQ',
      variable_state: {
        secondCounter: 2,
      },
      commands: {},
      line: false,
    },
    {
      variable_state: {
        thirdCounter: 3,
      },
      commands: {},
      id: 'BU0pizWMFXVFqmHt0cYGVp7hhqnKeH80',
    },
  ],
  enteringNewDiagram: false,
  locale: 'en-US',
  line_id: 'ck9tyiqhv007d3h5sbsfrng5x',
  platform: 'google',
  output: 'home flowsecond flowthird flowsay smth',
  repeat: 100,
  customer_info: {},
  skill_id: 4,
  end: false,
  alexa_permissions: [],
  oneShotIntent: 'Default Welcome Intent',
  supported_interfaces: {
    list: [
      {
        name: 'actions.capability.MEDIA_RESPONSE_AUDIO',
      },
      {
        name: 'actions.capability.AUDIO_OUTPUT',
      },
      {
        name: 'actions.capability.ACCOUNT_LINKING',
      },
      {
        name: 'actions.capability.SCREEN_OUTPUT',
      },
    ],
  },
  user: 'f1ad99de-d11d-4bda-aa39-0bfeccf218c2',
  timestamp: 1588686113381,
};

export const newFramesVariables = {
  stack: [
    {
      nodeID: 'ck9tyj3yx00943h5s629xvnda',
      variables: {
        homeCounter: 1,
      },
      storage: {
        // speak: 'home flow',
      },
      programID: 'F9QGfXDrhLZDJ1EYhg7c1KxxApAiVyD6',
      commands: [],
    },
    {
      nodeID: null,
      variables: {
        secondCounter: 2,
      },
      storage: {
        outputMap: [['homeCounter', 'secondCounter']],
        // speak: 'second flow',
      },
      programID: 'GXCNwfzhsxEXN9TfKVi6N98SqDCvb5HQ',
      commands: [],
    },
    {
      nodeID: 'ck9tyiqhv007d3h5sbsfrng5x',
      variables: {
        thirdCounter: 3,
      },
      storage: {
        outputMap: [['secondCounter', 'thirdCounter']],
        speak: 'say smth',
      },
      programID: 'BU0pizWMFXVFqmHt0cYGVp7hhqnKeH80',
      commands: [],
    },
  ],
  variables: {
    sessions: 1,
    voiceflow: {
      permissions: [],
      events: [],
      capabilities: {
        list: [
          {
            name: 'actions.capability.MEDIA_RESPONSE_AUDIO',
          },
          {
            name: 'actions.capability.AUDIO_OUTPUT',
          },
          {
            name: 'actions.capability.ACCOUNT_LINKING',
          },
          {
            name: 'actions.capability.SCREEN_OUTPUT',
          },
        ],
      },
    },
    locale: 'en-US',
    user_id: 'f1ad99de-d11d-4bda-aa39-0bfeccf218c2',
    platform: 'google',
    timestamp: 1588686113,
  },
  storage: {
    output: 'home flowsecond flowthird flowsay smth',
    sessions: 1,
    locale: 'en-US',
    user: 'f1ad99de-d11d-4bda-aa39-0bfeccf218c2',
    repeat: 100,
  },
};

// state containing commands
export const oldCommands = {
  sessions: 1,
  reprompt: 0,
  globals: [
    {
      sessions: 1,
      user_id: 'f1ad99de-d11d-4bda-aa39-0bfeccf218c2',
      numberSlot: 0,
      voiceflow: {
        permissions: [],
        events: [],
        capabilities: {
          list: [
            {
              name: 'actions.capability.ACCOUNT_LINKING',
            },
            {
              name: 'actions.capability.SCREEN_OUTPUT',
            },
            {
              name: 'actions.capability.MEDIA_RESPONSE_AUDIO',
            },
            {
              name: 'actions.capability.AUDIO_OUTPUT',
            },
          ],
        },
      },
      locale: 'en-US',
      platform: 'google',
      timestamp: 1588691586,
    },
  ],
  transformed_input: null,
  diagrams: [
    {
      variable_state: {},
      commands: {
        stop: {
          diagram_id: 'ZwE8jCRkVYkKOMBudoLOvKhWKNckqzb7',
          mappings: [
            {
              variable: 'numberSlot',
              slot: 'numberSlot',
            },
          ],
        },
        help: {
          diagram_id: 'vYaNNmof4rINFUUuso9qWCTPbyTkIuo2',
          mappings: [],
        },
      },
      speak: 'command speak',
      id: '0umP0s4TF7v00ueZy9R8EFiPPqxOWyCO',
    },
  ],
  enteringNewDiagram: false,
  locale: 'en-US',
  line_id: 'ck9u1k6hj000s3h5sy6fa2z3b',
  platform: 'google',
  output: 'say smth',
  repeat: 100,
  customer_info: {},
  skill_id: 10,
  end: false,
  alexa_permissions: [],
  oneShotIntent: 'Default Welcome Intent',
  supported_interfaces: {
    list: [
      {
        name: 'actions.capability.ACCOUNT_LINKING',
      },
      {
        name: 'actions.capability.SCREEN_OUTPUT',
      },
      {
        name: 'actions.capability.MEDIA_RESPONSE_AUDIO',
      },
      {
        name: 'actions.capability.AUDIO_OUTPUT',
      },
    ],
  },
  user: 'f1ad99de-d11d-4bda-aa39-0bfeccf218c2',
  timestamp: 1588691586085,
};

export const newCommands = {
  stack: [
    {
      nodeID: 'ck9u1k6hj000s3h5sy6fa2z3b',
      variables: {},
      storage: {
        speak: 'command speak',
        calledCommand: true,
      },
      programID: '0umP0s4TF7v00ueZy9R8EFiPPqxOWyCO',
      commands: [
        {
          diagram_id: 'ZwE8jCRkVYkKOMBudoLOvKhWKNckqzb7',
          mappings: [
            {
              variable: 'numberSlot',
              slot: 'numberSlot',
            },
          ],
          intent: 'stop',
        },
        {
          diagram_id: 'vYaNNmof4rINFUUuso9qWCTPbyTkIuo2',
          mappings: [],
          intent: 'help',
        },
      ],
    },
  ],
  variables: {
    sessions: 1,
    user_id: 'f1ad99de-d11d-4bda-aa39-0bfeccf218c2',
    numberSlot: 0,
    voiceflow: {
      permissions: [],
      events: [],
      capabilities: {
        list: [
          {
            name: 'actions.capability.ACCOUNT_LINKING',
          },
          {
            name: 'actions.capability.SCREEN_OUTPUT',
          },
          {
            name: 'actions.capability.MEDIA_RESPONSE_AUDIO',
          },
          {
            name: 'actions.capability.AUDIO_OUTPUT',
          },
        ],
      },
    },
    locale: 'en-US',
    platform: 'google',
    timestamp: 1588691586,
  },
  storage: {
    output: 'say smth',
    sessions: 1,
    locale: 'en-US',
    user: 'f1ad99de-d11d-4bda-aa39-0bfeccf218c2',
    repeat: 100,
  },
};

// resume after exiting
export const oldExit = {
  last_speak: 'Where are you from?',
  sessions: 1,
  reprompt: 0,
  globals: [
    {
      country: 0,
      sessions: 1,
      user_id: 'f1ad99de-d11d-4bda-aa39-0bfeccf218c2',
      voiceflow: {
        permissions: [],
        events: [],
        capabilities: {
          list: [
            {
              name: 'actions.capability.MEDIA_RESPONSE_AUDIO',
            },
            {
              name: 'actions.capability.AUDIO_OUTPUT',
            },
            {
              name: 'actions.capability.ACCOUNT_LINKING',
            },
            {
              name: 'actions.capability.SCREEN_OUTPUT',
            },
          ],
        },
      },
      citySlot: 0,
      locale: 'en-US',
      age: 18,
      platform: 'google',
      timestamp: 1588793982,
    },
  ],
  transformed_input: null,
  diagrams: [
    {
      variable_state: {},
      commands: {
        travel_intent: {
          next: 'ck9viadwg001l3h5spc9irn8s',
          mappings: [
            {
              variable: 'citySlot',
              slot: 'citySlot',
            },
          ],
        },
      },
      id: 'aH2arEqONjAij7JwN9014xri7Neg26iC',
    },
  ],
  enteringNewDiagram: false,
  locale: 'en-US',
  line_id: 'ck9vic27h00483h5sp53j41dj',
  platform: 'google',
  lastOutput: 'How old are you?',
  output: 'Where are you from?',
  repeat: 100,
  customer_info: {},
  skill_id: 28,
  end: false,
  alexa_permissions: [],
  supported_interfaces: {
    list: [
      {
        name: 'actions.capability.MEDIA_RESPONSE_AUDIO',
      },
      {
        name: 'actions.capability.AUDIO_OUTPUT',
      },
      {
        name: 'actions.capability.ACCOUNT_LINKING',
      },
      {
        name: 'actions.capability.SCREEN_OUTPUT',
      },
    ],
  },
  user: 'f1ad99de-d11d-4bda-aa39-0bfeccf218c2',
  timestamp: 1588793943118,
};

export const newExit = {
  stack: [
    {
      nodeID: 'ck9vic27h00483h5sp53j41dj',
      variables: {},
      storage: {
        speak: 'Where are you from?',
      },
      programID: 'aH2arEqONjAij7JwN9014xri7Neg26iC',
      commands: [
        {
          next: 'ck9viadwg001l3h5spc9irn8s',
          intent: 'travel_intent',
          mappings: [
            {
              variable: 'citySlot',
              slot: 'citySlot',
            },
          ],
        },
      ],
    },
  ],
  variables: {
    country: 0,
    sessions: 1,
    user_id: 'f1ad99de-d11d-4bda-aa39-0bfeccf218c2',
    voiceflow: {
      permissions: [],
      events: [],
      capabilities: {
        list: [
          {
            name: 'actions.capability.MEDIA_RESPONSE_AUDIO',
          },
          {
            name: 'actions.capability.AUDIO_OUTPUT',
          },
          {
            name: 'actions.capability.ACCOUNT_LINKING',
          },
          {
            name: 'actions.capability.SCREEN_OUTPUT',
          },
        ],
      },
    },
    citySlot: 0,
    locale: 'en-US',
    age: 18,
    platform: 'google',
    timestamp: 1588793982,
  },
  storage: {
    output: 'Where are you from?',
    sessions: 1,
    locale: 'en-US',
    user: 'f1ad99de-d11d-4bda-aa39-0bfeccf218c2',
    repeat: 100,
  },
};