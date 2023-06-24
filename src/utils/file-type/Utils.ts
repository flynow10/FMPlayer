import { BufferEncoding } from "./Types";

export function stringToBytes(string: string) {
  return [...string].map((character) => character.charCodeAt(0));
}

/**
Checks whether the TAR checksum is valid.

@param {Buffer} buffer - The TAR header `[offset ... offset + 512]`.
@param {number} offset - TAR header offset.
@returns {boolean} `true` if the TAR checksum is valid, otherwise `false`.
*/
export function tarHeaderChecksumMatches(buffer: Uint8Array, offset = 0) {
  const readSum = Number.parseInt(
    slowToString(buffer, "utf-8", 148, 154).replace(/\0.*$/, "").trim(),
    8
  ); // Read sum in header
  if (Number.isNaN(readSum)) {
    return false;
  }

  let sum = 8 * 0x20; // Initialize signed bit sum

  for (let index = offset; index < offset + 148; index++) {
    sum += buffer[index];
  }

  for (let index = offset + 156; index < offset + 512; index++) {
    sum += buffer[index];
  }

  return readSum === sum;
}

/**
ID3 UINT32 sync-safe tokenizer token.
28 bits (representing up to 256MB) integer, the msb is 0 to avoid "false syncsignals".
*/
export const uint32SyncSafeToken = {
  get: (buffer: Uint8Array, offset: number) =>
    (buffer[offset + 3] & 0x7f) |
    (buffer[offset + 2] << 7) |
    (buffer[offset + 1] << 14) |
    (buffer[offset] << 21),
  len: 4,
};

/*
  From Node Buffer polyfill https://github.com/feross/buffer/blob/master/index.js
  --------------------------------------------------------------------------
*/
export function slowToString(
  buffer: Uint8Array,
  encoding: BufferEncoding,
  start: number,
  end: number
) {
  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0;
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > buffer.length) {
    return "";
  }

  if (end === undefined || end > buffer.length) {
    end = buffer.length;
  }

  if (end <= 0) {
    return "";
  }

  // Force coercion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0;
  start >>>= 0;

  if (end <= start) {
    return "";
  }

  if (!encoding) encoding = "utf-8";

  for (;;) {
    switch (encoding) {
      case "utf-8":
        return utf8Slice(buffer, start, end);

      case "ascii":
        return asciiSlice(buffer, start, end);

      case "binary":
        return latin1Slice(buffer, start, end);
    }
  }
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
const MAX_ARGUMENTS_LENGTH = 0x1000;

function decodeCodePointsArray(codePoints: number[]) {
  const len = codePoints.length;
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode(...codePoints); // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  let res = "";
  let i = 0;
  while (i < len) {
    res += String.fromCharCode(
      ...codePoints.slice(i, (i += MAX_ARGUMENTS_LENGTH))
    );
  }
  return res;
}

function utf8Slice(buf: Uint8Array, start: number, end: number) {
  end = Math.min(buf.length, end);
  const res = [];

  let i = start;
  while (i < end) {
    const firstByte = buf[i];
    let codePoint = null;
    let bytesPerSequence =
      firstByte > 0xef ? 4 : firstByte > 0xdf ? 3 : firstByte > 0xbf ? 2 : 1;

    if (i + bytesPerSequence <= end) {
      let secondByte, thirdByte, fourthByte, tempCodePoint;

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte;
          }
          break;
        case 2:
          secondByte = buf[i + 1];
          if ((secondByte & 0xc0) === 0x80) {
            tempCodePoint = ((firstByte & 0x1f) << 0x6) | (secondByte & 0x3f);
            if (tempCodePoint > 0x7f) {
              codePoint = tempCodePoint;
            }
          }
          break;
        case 3:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          if ((secondByte & 0xc0) === 0x80 && (thirdByte & 0xc0) === 0x80) {
            tempCodePoint =
              ((firstByte & 0xf) << 0xc) |
              ((secondByte & 0x3f) << 0x6) |
              (thirdByte & 0x3f);
            if (
              tempCodePoint > 0x7ff &&
              (tempCodePoint < 0xd800 || tempCodePoint > 0xdfff)
            ) {
              codePoint = tempCodePoint;
            }
          }
          break;
        case 4:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          fourthByte = buf[i + 3];
          if (
            (secondByte & 0xc0) === 0x80 &&
            (thirdByte & 0xc0) === 0x80 &&
            (fourthByte & 0xc0) === 0x80
          ) {
            tempCodePoint =
              ((firstByte & 0xf) << 0x12) |
              ((secondByte & 0x3f) << 0xc) |
              ((thirdByte & 0x3f) << 0x6) |
              (fourthByte & 0x3f);
            if (tempCodePoint > 0xffff && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint;
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xfffd;
      bytesPerSequence = 1;
    } else if (codePoint > 0xffff) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000;
      res.push(((codePoint >>> 10) & 0x3ff) | 0xd800);
      codePoint = 0xdc00 | (codePoint & 0x3ff);
    }

    res.push(codePoint);
    i += bytesPerSequence;
  }

  return decodeCodePointsArray(res);
}

function asciiSlice(buf: Uint8Array, start: number, end: number) {
  let ret = "";
  end = Math.min(buf.length, end);

  for (let i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7f);
  }
  return ret;
}

function latin1Slice(buf: Uint8Array, start: number, end: number) {
  let ret = "";
  end = Math.min(buf.length, end);

  for (let i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i]);
  }
  return ret;
}

export function bufferIndexOf(
  buffer: Uint8Array,
  val: Uint8Array | string | number,
  byteOffset: string | number = 0,
  encoding?: string
) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1;

  // Normalize byteOffset
  if (typeof byteOffset === "string") {
    encoding = byteOffset;
    byteOffset = 0;
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff;
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000;
  }
  byteOffset = +byteOffset; // Coerce to Number.
  if (Number.isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = 0;
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
  if (byteOffset >= buffer.length) {
    return -1;
  } else if (byteOffset < 0) {
    byteOffset = 0;
  }

  // Normalize val
  if (typeof val === "string") {
    val = fromString(val, encoding);
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (val instanceof Uint8Array) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1;
    }
    return arrayIndexOf(buffer, val, byteOffset);
  } else if (typeof val === "number") {
    val = val & 0xff; // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === "function") {
      return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
    }
    return arrayIndexOf(buffer, [val], byteOffset);
  }

  throw new TypeError("val must be string, number or Buffer");
}

function fromString(string: string, encoding?: string) {
  if (typeof encoding !== "string" || encoding === "") {
    encoding = "utf8";
  }

  const length = byteLength(string, encoding) | 0;
  let buf = new Uint8Array(length);

  const actual = write(buf, string, encoding);

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual);
  }

  return buf;
}

function byteLength(string: string, encoding: string) {
  const len = string.length;
  // const mustMatch = arguments.length > 2 && arguments[2] === true;
  // if (!mustMatch && len === 0) return 0;

  // Use a for loop to avoid recursion
  let loweredCase = false;
  for (;;) {
    switch (encoding) {
      case "ascii":
      case "latin1":
      case "binary":
        return len;
      case "utf8":
      case "utf-8":
        return utf8ToBytes(string).length;
      // throw new Error("utf-8 encoding is not supported for byteLength");
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return len * 2;
      case "hex":
        return len >>> 1;
      case "base64":
        throw new Error("base64 encoding is not supported for byteLength");
      default:
        if (loweredCase) {
          return -1;
        }
        encoding = ("" + encoding).toLowerCase();
        loweredCase = true;
    }
  }
}

function write(buffer: Uint8Array, string: string, encoding: string) {
  // Buffer#write(string)
  const offset = 0;
  let length = buffer.length;

  const remaining = buffer.length - offset;
  if (length === undefined || length > remaining) length = remaining;

  if (
    (string.length > 0 && (length < 0 || offset < 0)) ||
    offset > buffer.length
  ) {
    throw new RangeError("Attempt to write outside buffer bounds");
  }

  if (!encoding) encoding = "utf8";

  let loweredCase = false;
  for (;;) {
    switch (encoding) {
      case "hex":
        return hexWrite(buffer, string, offset, length);

      case "utf8":
      case "utf-8":
        // throw new Error("utf-8 encoding is not supported for write");
        return utf8Write(buffer, string, offset, length);

      case "ascii":
      case "latin1":
      case "binary":
        throw new Error("binary encoding is not supported for write");
      // return asciiWrite(this, string, offset, length)

      case "base64":
        // Warning: maxLength not taken into account in base64Write
        throw new Error("base64 encoding is not supported for write");
      // return base64Write(this, string, offset, length)

      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        throw new Error("utf-16le encoding is not supported for write");
      // return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
        encoding = ("" + encoding).toLowerCase();
        loweredCase = true;
    }
  }
}

function hexWrite(
  buf: Uint8Array,
  string: string,
  offset: number,
  length: number
) {
  offset = Number(offset) || 0;
  const remaining = buf.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = Number(length);
    if (length > remaining) {
      length = remaining;
    }
  }

  const strLen = string.length;

  if (length > strLen / 2) {
    length = strLen / 2;
  }
  let i;
  for (i = 0; i < length; ++i) {
    const parsed = parseInt(string.substr(i * 2, 2), 16);
    if (Number.isNaN(parsed)) return i;
    buf[offset + i] = parsed;
  }
  return i;
}

function blitBuffer(
  src: number[],
  dst: Uint8Array,
  offset: number,
  length: number
) {
  let i;
  for (i = 0; i < length; ++i) {
    if (i + offset >= dst.length || i >= src.length) break;
    dst[i + offset] = src[i];
  }
  return i;
}

function utf8Write(
  buf: Uint8Array,
  string: string,
  offset: number,
  length: number
) {
  return blitBuffer(
    utf8ToBytes(string, buf.length - offset),
    buf,
    offset,
    length
  );
}

function utf8ToBytes(string: string, units?: number) {
  units = units || Infinity;
  let codePoint;
  const length = string.length;
  let leadSurrogate = null;
  const bytes = [];

  for (let i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i);

    // is surrogate component
    if (codePoint > 0xd7ff && codePoint < 0xe000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xdbff) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xef, 0xbf, 0xbd);
          continue;
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xef, 0xbf, 0xbd);
          continue;
        }

        // valid lead
        leadSurrogate = codePoint;

        continue;
      }

      // 2 leads in a row
      if (codePoint < 0xdc00) {
        if ((units -= 3) > -1) bytes.push(0xef, 0xbf, 0xbd);
        leadSurrogate = codePoint;
        continue;
      }

      // valid surrogate pair
      codePoint =
        (((leadSurrogate - 0xd800) << 10) | (codePoint - 0xdc00)) + 0x10000;
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xef, 0xbf, 0xbd);
    }

    leadSurrogate = null;

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break;
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break;
      bytes.push((codePoint >> 0x6) | 0xc0, (codePoint & 0x3f) | 0x80);
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break;
      bytes.push(
        (codePoint >> 0xc) | 0xe0,
        ((codePoint >> 0x6) & 0x3f) | 0x80,
        (codePoint & 0x3f) | 0x80
      );
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break;
      bytes.push(
        (codePoint >> 0x12) | 0xf0,
        ((codePoint >> 0xc) & 0x3f) | 0x80,
        ((codePoint >> 0x6) & 0x3f) | 0x80,
        (codePoint & 0x3f) | 0x80
      );
    } else {
      throw new Error("Invalid code point");
    }
  }

  return bytes;
}

function arrayIndexOf(
  arr: Uint8Array,
  val: ArrayLike<number>,
  byteOffset: number
) {
  const indexSize = 1;
  const arrLength = arr.length;
  const valLength = val.length;

  function read(buf: ArrayLike<number>, i: number) {
    return buf[i];
  }

  let i;
  let foundIndex = -1;
  for (i = byteOffset; i < arrLength; i++) {
    if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
      if (foundIndex === -1) foundIndex = i;
      if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
    } else {
      if (foundIndex !== -1) i -= i - foundIndex;
      foundIndex = -1;
    }
  }

  return -1;
}

function checkOffset(offset: number, ext: number, length: number) {
  if (offset % 1 !== 0 || offset < 0)
    throw new RangeError("offset is not uint");
  if (offset + ext > length)
    throw new RangeError("Trying to access beyond buffer length");
}

export function readUIntBE(
  buffer: Uint8Array,
  offset: number,
  byteLength: number,
  noAssert?: boolean
) {
  offset = offset >>> 0;
  byteLength = byteLength >>> 0;
  if (!noAssert) {
    checkOffset(offset, byteLength, buffer.length);
  }

  let val = buffer[offset + --byteLength];
  let mul = 1;
  while (byteLength > 0 && (mul *= 0x100)) {
    val += buffer[offset + --byteLength] * mul;
  }

  return val;
}

export function readUInt32LE(
  buffer: Uint8Array,
  offset: number,
  noAssert?: boolean
) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 4, buffer.length);

  return (
    (buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16)) +
    buffer[offset + 3] * 0x1000000
  );
}

export function readUInt16LE(
  buffer: Uint8Array,
  offset: number,
  noAssert?: boolean
) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 2, buffer.length);
  return buffer[offset] | (buffer[offset + 1] << 8);
}

/*
  ----------------
*/
