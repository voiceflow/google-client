import { AbstractManager } from './types';

class AdapterManager extends AbstractManager {
  async context(state: Record<any, any>) {
    let newContext;

    try {
      newContext = {
        stack: state.diagrams?.reduce((acc: any[], d: any, index: any) => {
          const frame = {
            blockID: d.line === false ? null : d.line,
            diagramID: d.id,
            variables: d.variable_state,
            storage: {
              // output map is stored in previous frame in old server
              ...(state.diagrams[index - 1]?.output_map && { outputMap: state.diagrams[index - 1]?.output_map }),
            } as any,
            commands: Object.keys(d.commands).reduce((commandsAcc: any[], key) => {
              const oldCommand = d.commands[key];
              const command = {
                diagram_id: oldCommand.diagram_id,
                mappings: oldCommand.mappings,
                end: oldCommand.end,
                intent: key,
              };
              commandsAcc.push(command);

              return commandsAcc;
            }, [] as any),
          };

          if (index === state.diagrams.length - 1) {
            frame.blockID = state.line_id;
            // speak for each frame is the output they produced. we dont keep track of this in old server
            // frame.storage = { ...frame.storage, /* outputMap: [], */ speak: state.output };
          }

          acc.push(frame);

          return acc;
        }, []),
        storage: {
          output: state.output,
          sessions: state.sessions,
          repeat: state.repeat,
          locale: state.locale,
          user: state.user,
          ...(state.randoms && { randoms: state.randoms }), // conditionally add randoms
        },
        variables: {
          // everything in variables
          ...state.globals[0],
          // filter out not needed keys in vf specific variables
          voiceflow: Object.keys(state.globals[0].voiceflow).reduce((acc: Record<string, any>, key: string) => {
            if (['events'].includes(key)) {
              acc[key] = state.globals[0].voiceflow[key];
            }

            return acc;
          }, {}),
        },
      };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('context adapter err: ', err);
      newContext = {};
    }

    return newContext;
  }
}

export default AdapterManager;
