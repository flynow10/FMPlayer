import { BufferTokenizer } from "./BufferTokenizer";

export function fromBuffer(uint8Array: Uint8Array) {
  return new BufferTokenizer(uint8Array);
}
