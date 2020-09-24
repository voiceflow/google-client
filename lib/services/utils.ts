// eslint-disable-next-line import/prefer-default-export
export const generateResponseText = (output: string) => (output.replace(/<[^><]+\/?>/g, '').trim().length === 0 ? '🔊' : undefined);
