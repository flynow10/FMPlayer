import { AbstractTokenizer } from "./AbstractTokenizer";
import { EndOfStreamError } from "./EndOfStreamError";
import { IReadChunkOptions } from "./ITokenizer";

export class BufferTokenizer extends AbstractTokenizer {
  private uint8Array: Uint8Array;
  /**
   * Construct BufferTokenizer
   * @param uint8Array - Uint8Array to tokenize
   * @param fileInfo - Pass additional file information to the tokenizer
   */
  constructor(uint8Array: Uint8Array) {
    super();
    this.uint8Array = uint8Array;
    this.fileInfo.size = uint8Array.length;
  }
  /**
   * Read buffer from tokenizer
   * @param uint8Array - Uint8Array to tokenize
   * @param options - Read behaviour options
   * @returns {Promise<number>}
   */
  async readBuffer(uint8Array: Uint8Array, options: IReadChunkOptions) {
    if (options && options.position) {
      if (options.position < this.position) {
        throw new Error(
          "`options.position` must be equal or greater than `tokenizer.position`"
        );
      }
      this.position = options.position;
    }
    const bytesRead = await this.peekBuffer(uint8Array, options);
    this.position += bytesRead;
    return bytesRead;
  }
  /**
   * Peek (read ahead) buffer from tokenizer
   * @param uint8Array
   * @param options - Read behaviour options
   * @returns {Promise<number>}
   */
  async peekBuffer(uint8Array: Uint8Array, options: IReadChunkOptions) {
    const normOptions = this.normalizeOptions(uint8Array, options);
    const bytes2read = Math.min(
      this.uint8Array.length - normOptions.position,
      normOptions.length
    );
    if (!normOptions.mayBeLess && bytes2read < normOptions.length) {
      throw new EndOfStreamError();
    } else {
      uint8Array.set(
        this.uint8Array.subarray(
          normOptions.position,
          normOptions.position + bytes2read
        ),
        normOptions.offset
      );
      return bytes2read;
    }
  }
  async close() {
    // empty
  }
}
