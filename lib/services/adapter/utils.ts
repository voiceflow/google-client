import { Commands, NewStateStack, NewStateStorage, NewStateVariables, OldCommands, OldStateRaw } from './types';

export const commandAdapter = (oldCommands: OldCommands): Commands =>
  Object.keys(oldCommands).reduce((commandsAcc, key) => {
    const oldCommand = oldCommands[key];
    const command = {
      mappings: oldCommand.mappings,
      intent: key,
      ...(oldCommand.diagram_id && { diagram_id: oldCommand.diagram_id }), // command
      ...(oldCommand.next && { next: oldCommand.next }), // intent
    };
    commandsAcc.push(command);

    return commandsAcc;
  }, [] as Commands);

export const stackAdapter = (oldState: OldStateRaw): NewStateStack =>
  oldState.diagrams?.reduce((acc, d, index) => {
    const frame = {
      nodeID: d.line === false ? null : d.line,
      programID: d.id,
      variables: d.variable_state,
      storage: {
        // speak is only added in the old server during commands
        ...(d.speak && { speak: d.speak, calledCommand: true }),
        // output map is stored in previous frame in old server
        ...(oldState.diagrams[index - 1]?.output_map && { outputMap: oldState.diagrams[index - 1].output_map }),
      } as any,
      commands: commandAdapter(d.commands),
    };

    if (index === oldState.diagrams.length - 1) {
      // nodeID for top of the stack frame is kept in line_id in old state
      frame.nodeID = oldState.line_id;
      // old server only keeps what the last diagram spoke
      if (oldState.last_speak) frame.storage.speak = oldState.last_speak;
    }

    acc.push(frame);

    return acc;
  }, [] as NewStateStack) || [];

export const storageAdapter = (oldState: OldStateRaw): NewStateStorage => ({
  output: oldState.output,
  sessions: oldState.sessions,
  repeat: oldState.repeat,
  locale: oldState.locale,
  user: oldState.user,
  ...(oldState.randoms && { randoms: oldState.randoms }), // conditionally add randoms
});

export const variablesAdapter = (oldState: OldStateRaw): NewStateVariables => oldState.globals[0] || { voiceflow: { events: [] } };
