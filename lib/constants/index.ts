// eslint-disable-next-line import/prefer-default-export
export { default as Flags, Turn as T, Storage as S, Frame as F, Variables as V } from './flags';

export enum Source {
  MONGO = 'mongo',
  DYNAMO = 'dynamo',
  LOCAL = 'local',
}
