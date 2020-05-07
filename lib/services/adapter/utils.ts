import { Commands, NewContextStack, NewContextStorage, NewContextVariables, OldCommands, OldContextRaw } from './types';

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

export const stackAdapter = (oldContext: OldContextRaw): NewContextStack =>
  oldContext.diagrams?.reduce((acc, d, index) => {
    const frame = {
      blockID: d.line === false ? null : d.line,
      diagramID: d.id,
      variables: d.variable_state,
      storage: {
        // speak is only added in the old server during commands
        ...(d.speak && { speak: d.speak, calledCommand: true }),
        // output map is stored in previous frame in old server
        ...(oldContext.diagrams[index - 1]?.output_map && { outputMap: oldContext.diagrams[index - 1].output_map }),
      } as any,
      commands: commandAdapter(d.commands),
    };

    // blockID for top of the stack frame is kept in line_id in old context
    if (index === oldContext.diagrams.length - 1) {
      frame.blockID = oldContext.line_id;
      // old server only keeps what the last diagram spoke
      if (oldContext.last_speak) frame.storage.speak = oldContext.last_speak;
    }

    acc.push(frame);

    return acc;
  }, [] as NewContextStack) || [];

export const storageAdapter = (oldContext: OldContextRaw): NewContextStorage => ({
  output: oldContext.output,
  sessions: oldContext.sessions,
  repeat: oldContext.repeat,
  locale: oldContext.locale,
  user: oldContext.user,
  ...(oldContext.randoms && { randoms: oldContext.randoms }), // conditionally add randoms
});

export const variablesAdapter = (oldContext: OldContextRaw): NewContextVariables => oldContext.globals[0] || { voiceflow: { events: [] } };
