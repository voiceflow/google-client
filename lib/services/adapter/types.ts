export type OldCommands = {
  [key: string]: {
    mappings: Array<{ variable: string; slot: string }>;
    diagram_id: string; // when command
    end: boolean; // when command
    next: string; // when intent
  };
};

export type OldStateRaw = {
  line_id: string;
  output: string;
  last_speak?: string;
  sessions: number;
  repeat: number;
  locale: string;
  user: string;
  randoms?: Record<string, string[]>;
  globals: [
    {
      [key: string]: any;
      voiceflow: { [key: string]: any; events: any[] };
    }
  ];
  diagrams: Array<{
    line: string | false;
    id: string;
    variable_state: Record<string, any>;
    output_map?: Array<[string, string]>;
    commands: OldCommands;
    speak: string;
  }>;
};

export type Command = {
  diagram_id?: string; // when command
  next?: string; // when intent
  mappings: Array<{ variable: string; slot: string }>;
  end?: boolean; // when command
  intent: string;
};
export type Commands = Array<Command>;

export type Frame = {
  nodeID: string | null;
  programID: string;
  variables: Record<string, any>;
  storage: {
    [key: string]: any;
    outputMap?: Array<[string, string]>;
    speak?: string;
    calledCommand?: boolean;
  };
  commands: Commands;
};

export type NewStateStack = Array<Frame>;

export type NewStateStorage = {
  output: string;
  sessions: number;
  repeat: number;
  locale: string;
  user: string;
  randoms?: Record<string, string[]>;
};

export type NewVoiceflowVars = {
  [key: string]: any;
  events: any[];
  capabilities?: string;
};

export type NewStateVariables = {
  [key: string]: any;
  voiceflow: NewVoiceflowVars;
};

export type NewStateRaw = {
  stack: NewStateStack;
  storage: NewStateStorage;
  variables: NewStateVariables;
};
