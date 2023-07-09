export const defaultMessages = "End-Of-Stream";

export class EndOfStreamError extends Error {
  constructor() {
    super(defaultMessages);
  }
}
