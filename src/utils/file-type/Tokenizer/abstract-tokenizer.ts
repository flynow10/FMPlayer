import { FileType } from "@/src/types/file-type";

import { EndOfStreamError } from "./end-of-stream-error";

export abstract class AbstractTokenizer implements FileType.ITokenizer {
  fileInfo: FileType.IFileInfo;
  public position: number;
  private numBuffer: Uint8Array;

  constructor(fileInfo?: FileType.IFileInfo) {
    /**
     * Tokenizer-stream position
     */
    this.position = 0;
    this.numBuffer = new Uint8Array(8);
    this.fileInfo = fileInfo ? fileInfo : {};
  }
  /**
   * Read buffer from tokenizer
   * @param buffer - Target buffer to fill with data read from the tokenizer-stream
   * @param options - Additional read options
   * @returns Promise with number of bytes read
   */
  abstract readBuffer(
    buffer: Uint8Array,
    options?: FileType.IReadChunkOptions
  ): Promise<number>;
  /**
   * Peek (read ahead) buffer from tokenizer
   * @param uint8Array- Target buffer to fill with data peek from the tokenizer-stream
   * @param options - Peek behaviour options
   * @returns Promise with number of bytes read
   */
  abstract peekBuffer(
    uint8Array: Uint8Array,
    options?: FileType.IReadChunkOptions
  ): Promise<number>;
  /**
   * Read a token from the tokenizer-stream
   * @param token - The token to read
   * @param position - If provided, the desired position in the tokenizer-stream
   * @returns Promise with token data
   */
  async readToken<Value>(
    token: FileType.IGetToken<Value>,
    position = this.position
  ) {
    const uint8Array = new Uint8Array(token.len); //Buffer.alloc(token.len);
    const len = await this.readBuffer(uint8Array, { position });
    if (len < token.len) throw new EndOfStreamError();
    return token.get(uint8Array, 0);
  }
  /**
   * Peek a token from the tokenizer-stream.
   * @param token - Token to peek from the tokenizer-stream.
   * @param position - Offset where to begin reading within the file. If position is null, data will be read from the current file position.
   * @returns Promise with token data
   */
  async peekToken<Value>(
    token: FileType.IGetToken<Value>,
    position = this.position
  ) {
    const uint8Array = new Uint8Array(token.len); //Buffer.alloc(token.len);
    const len = await this.peekBuffer(uint8Array, { position });
    if (len < token.len) throw new EndOfStreamError();
    return token.get(uint8Array, 0);
  }
  /**
   * Read a numeric token from the stream
   * @param token - Numeric token
   * @returns Promise with number
   */
  async readNumber<Value>(token: FileType.IGetToken<Value>) {
    const len = await this.readBuffer(this.numBuffer, { length: token.len });
    if (len < token.len) throw new EndOfStreamError();
    return token.get(this.numBuffer, 0);
  }
  /**
   * Read a numeric token from the stream
   * @param token - Numeric token
   * @returns Promise with number
   */
  async peekNumber<Value>(token: FileType.IGetToken<Value>) {
    const len = await this.peekBuffer(this.numBuffer, { length: token.len });
    if (len < token.len) throw new EndOfStreamError();
    return token.get(this.numBuffer, 0);
  }
  /**
   * Ignore number of bytes, advances the pointer in under tokenizer-stream.
   * @param length - Number of bytes to ignore
   * @return resolves the number of bytes ignored, equals length if this available, otherwise the number of bytes available
   */
  async ignore(length: number) {
    if (this.fileInfo.size !== undefined) {
      const bytesLeft = this.fileInfo.size - this.position;

      if (length > bytesLeft) {
        this.position += bytesLeft;
        return bytesLeft;
      }
    }

    this.position += length;
    return length;
  }
  async close() {
    // empty
  }
  normalizeOptions(
    uint8Array: Uint8Array,
    options: FileType.IReadChunkOptions
  ) {
    if (
      options &&
      options.position !== undefined &&
      options.position < this.position
    ) {
      throw new Error(
        "`options.position` must be equal or greater than `tokenizer.position`"
      );
    }

    if (options) {
      return {
        mayBeLess: options.mayBeLess === true,
        offset: options.offset ? options.offset : 0,
        length: options.length
          ? options.length
          : uint8Array.length - (options.offset ? options.offset : 0),
        position: options.position ? options.position : this.position,
      };
    }

    return {
      mayBeLess: false,
      offset: 0,
      length: uint8Array.length,
      position: this.position,
    };
  }
}
