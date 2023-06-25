import { BufferTokenizer } from "./buffer-tokenizer";

export function fromBuffer(uint8Array: Uint8Array) {
  return new BufferTokenizer(uint8Array);
}
