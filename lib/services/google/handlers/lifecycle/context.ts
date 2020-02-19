import Client, { Context, State } from '@voiceflow/client';

const context = async (versionID: string, _userID: string, voiceflow: Client): Promise<Context> => {
  const rawState = {};

  return voiceflow.createContext(versionID, rawState as State);
};

export default context;
