import { State as StateObj } from '@voiceflow/runtime';

export { default as MongoState } from './mongo';
export { default as DynamoState } from './dynamo';

export interface State {
  saveToDb(userId: string, state: StateObj): Promise<void>;
  getFromDb(userId: string): Promise<Record<string, any>>;
}
