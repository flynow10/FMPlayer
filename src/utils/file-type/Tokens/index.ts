import { FileType } from "@/src/types/file-type";
import { slowToString } from "../utils";

function dv<Array extends Uint8Array = Uint8Array>(array: Array) {
  return new DataView(array.buffer, array.byteOffset);
}

export const UINT8: FileType.IToken<number> = {
  len: 1,
  get(array, offset) {
    return dv(array).getUint8(offset);
  },
  put(array, offset, value) {
    dv(array).setUint8(offset, value);
    return offset + 1;
  },
};

/**
 * 16-bit unsigned integer, Big Endian byte order
 */
export const UINT16_BE: FileType.IToken<number> = {
  len: 2,
  get(array, offset) {
    return dv(array).getUint16(offset);
  },
  put(array, offset, value) {
    dv(array).setUint16(offset, value);
    return offset + 2;
  },
};

/**
 * 16-bit unsigned integer, Little Endian byte order
 */
export const UINT16_LE: FileType.IToken<number> = {
  len: 2,
  get(array, offset) {
    return dv(array).getUint16(offset, true);
  },
  put(array, offset, value) {
    dv(array).setUint16(offset, value, true);
    return offset + 2;
  },
};

/**
 * 32-bit unsigned integer, Big Endian byte order
 */
export const UINT32_BE: FileType.IToken<number> = {
  len: 4,
  get(array, offset) {
    return dv(array).getUint32(offset);
  },
  put(array, offset, value) {
    dv(array).setUint32(offset, value);
    return offset + 4;
  },
};

/**
 * 32-bit unsigned integer, Little Endian byte order
 */
export const UINT32_LE: FileType.IToken<number> = {
  len: 4,
  get(array, offset) {
    return dv(array).getUint32(offset, true);
  },
  put(array, offset, value) {
    dv(array).setUint32(offset, value, true);
    return offset + 4;
  },
};

/**
 * 64-bit unsigned integer, Little Endian byte order
 */
export const UINT64_LE: FileType.IToken<bigint> = {
  len: 8,
  get(array, offset) {
    return dv(array).getBigUint64(offset, true);
  },
  put(array, offset, value) {
    dv(array).setBigUint64(offset, value, true);
    return offset + 8;
  },
};

/**
 * 32-bit signed integer, Big Endian byte order
 */
export const INT32_BE: FileType.IToken<number> = {
  len: 4,
  get(array, offset) {
    return dv(array).getInt32(offset);
  },
  put(array, offset, value) {
    dv(array).setInt32(offset, value);
    return offset + 4;
  },
};

export class StringType {
  len: number;
  encoding: FileType.BufferEncoding;
  constructor(len: number, encoding: FileType.BufferEncoding) {
    this.len = len;
    this.encoding = encoding;
  }
  get(uint8Array: Uint8Array, offset: number) {
    return slowToString(uint8Array, this.encoding, offset, offset + this.len);
  }
}
