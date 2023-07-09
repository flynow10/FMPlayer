export namespace FileType {
  export type FileExtension =
    | "jpg"
    | "png"
    | "apng"
    | "gif"
    | "webp"
    | "flif"
    | "xcf"
    | "cr2"
    | "cr3"
    | "orf"
    | "arw"
    | "dng"
    | "nef"
    | "rw2"
    | "raf"
    | "tif"
    | "bmp"
    | "icns"
    | "jxr"
    | "psd"
    | "indd"
    | "zip"
    | "tar"
    | "rar"
    | "gz"
    | "bz2"
    | "7z"
    | "dmg"
    | "mp4"
    | "mid"
    | "mkv"
    | "webm"
    | "mov"
    | "avi"
    | "mpg"
    | "mp2"
    | "mp3"
    | "m4a"
    | "ogg"
    | "opus"
    | "flac"
    | "wav"
    | "qcp"
    | "amr"
    | "pdf"
    | "epub"
    | "mobi"
    | "elf"
    | "exe"
    | "swf"
    | "rtf"
    | "woff"
    | "woff2"
    | "eot"
    | "ttf"
    | "otf"
    | "ico"
    | "flv"
    | "ps"
    | "xz"
    | "sqlite"
    | "nes"
    | "crx"
    | "xpi"
    | "cab"
    | "deb"
    | "ar"
    | "rpm"
    | "Z"
    | "lz"
    | "cfb"
    | "mxf"
    | "mts"
    | "wasm"
    | "blend"
    | "bpg"
    | "docx"
    | "pptx"
    | "xlsx"
    | "3gp"
    | "3g2"
    | "j2c"
    | "jp2"
    | "jpm"
    | "jpx"
    | "mj2"
    | "aif"
    | "odt"
    | "ods"
    | "odp"
    | "xml"
    | "heic"
    | "cur"
    | "ktx"
    | "ape"
    | "wv"
    | "asf"
    | "dcm"
    | "mpc"
    | "ics"
    | "glb"
    | "pcap"
    | "dsf"
    | "lnk"
    | "alias"
    | "voc"
    | "ac3"
    | "m4b"
    | "m4p"
    | "m4v"
    | "f4a"
    | "f4b"
    | "f4p"
    | "f4v"
    | "mie"
    | "ogv"
    | "ogm"
    | "oga"
    | "spx"
    | "ogx"
    | "arrow"
    | "shp"
    | "aac"
    | "mp1"
    | "it"
    | "s3m"
    | "xm"
    | "ai"
    | "skp"
    | "avif"
    | "eps"
    | "lzh"
    | "pgp"
    | "asar"
    | "stl"
    | "chm"
    | "3mf"
    | "zst"
    | "jxl"
    | "vcf"
    | "jls"
    | "pst"
    | "dwg"
    | "parquet"
    | "class"
    | "arj"
    | "cpio"
    | "ace"
    | "avro"
    | "icc";

  export type Mime =
    | "image/jpeg"
    | "image/png"
    | "image/gif"
    | "image/webp"
    | "image/flif"
    | "image/x-xcf"
    | "image/x-canon-cr2"
    | "image/x-canon-cr3"
    | "image/tiff"
    | "image/bmp"
    | "image/icns"
    | "image/vnd.ms-photo"
    | "image/vnd.adobe.photoshop"
    | "application/x-indesign"
    | "application/epub+zip"
    | "application/x-xpinstall"
    | "application/vnd.oasis.opendocument.text"
    | "application/vnd.oasis.opendocument.spreadsheet"
    | "application/vnd.oasis.opendocument.presentation"
    | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    | "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    | "application/zip"
    | "application/x-tar"
    | "application/x-rar-compressed"
    | "application/gzip"
    | "application/x-bzip2"
    | "application/x-7z-compressed"
    | "application/x-apple-diskimage"
    | "video/mp4"
    | "audio/midi"
    | "video/x-matroska"
    | "video/webm"
    | "video/quicktime"
    | "video/vnd.avi"
    | "audio/vnd.wave"
    | "audio/qcelp"
    | "audio/x-ms-asf"
    | "video/x-ms-asf"
    | "application/vnd.ms-asf"
    | "video/mpeg"
    | "video/3gpp"
    | "audio/mpeg"
    | "audio/mp4" // RFC 4337
    | "audio/opus"
    | "video/ogg"
    | "audio/ogg"
    | "application/ogg"
    | "audio/x-flac"
    | "audio/ape"
    | "audio/wavpack"
    | "audio/amr"
    | "application/pdf"
    | "application/x-elf"
    | "application/x-msdownload"
    | "application/x-shockwave-flash"
    | "application/rtf"
    | "application/wasm"
    | "font/woff"
    | "font/woff2"
    | "application/vnd.ms-fontobject"
    | "font/ttf"
    | "font/otf"
    | "image/x-icon"
    | "video/x-flv"
    | "application/postscript"
    | "application/eps"
    | "application/x-xz"
    | "application/x-sqlite3"
    | "application/x-nintendo-nes-rom"
    | "application/x-google-chrome-extension"
    | "application/vnd.ms-cab-compressed"
    | "application/x-deb"
    | "application/x-unix-archive"
    | "application/x-rpm"
    | "application/x-compress"
    | "application/x-lzip"
    | "application/x-cfb"
    | "application/x-mie"
    | "application/x-apache-arrow"
    | "application/mxf"
    | "video/mp2t"
    | "application/x-blender"
    | "image/bpg"
    | "image/j2c"
    | "image/jp2"
    | "image/jpx"
    | "image/jpm"
    | "image/mj2"
    | "audio/aiff"
    | "application/xml"
    | "application/x-mobipocket-ebook"
    | "image/heif"
    | "image/heif-sequence"
    | "image/heic"
    | "image/heic-sequence"
    | "image/ktx"
    | "application/dicom"
    | "audio/x-musepack"
    | "text/calendar"
    | "text/vcard"
    | "model/gltf-binary"
    | "application/vnd.tcpdump.pcap"
    | "audio/x-dsf" // Non-standard
    | "application/x.ms.shortcut" // Invented by us
    | "application/x.apple.alias" // Invented by us
    | "audio/x-voc"
    | "audio/vnd.dolby.dd-raw"
    | "audio/x-m4a"
    | "image/apng"
    | "image/x-olympus-orf"
    | "image/x-sony-arw"
    | "image/x-adobe-dng"
    | "image/x-nikon-nef"
    | "image/x-panasonic-rw2"
    | "image/x-fujifilm-raf"
    | "video/x-m4v"
    | "video/3gpp2"
    | "application/x-esri-shape"
    | "audio/aac"
    | "audio/x-it"
    | "audio/x-s3m"
    | "audio/x-xm"
    | "video/MP1S"
    | "video/MP2P"
    | "application/vnd.sketchup.skp"
    | "image/avif"
    | "application/x-lzh-compressed"
    | "application/pgp-encrypted"
    | "application/x-asar"
    | "model/stl"
    | "application/vnd.ms-htmlhelp"
    | "model/3mf"
    | "image/jxl"
    | "application/zstd"
    | "image/jls"
    | "application/vnd.ms-outlook"
    | "image/vnd.dwg"
    | "application/x-parquet"
    | "application/java-vm"
    | "application/x-arj"
    | "application/x-cpio"
    | "application/x-ace-compressed"
    | "application/avro"
    | "application/vnd.iccprofile";

  export type FileTypeResult = {
    /**
    One of the supported [file types](https://github.com/sindresorhus/file-type#supported-file-types).
    */
    readonly ext: FileExtension;

    /**
    The detected [MIME type](https://en.wikipedia.org/wiki/Internet_media_type).
    */
    readonly mime: Mime;
  };

  export type CheckOptions = { offset: number; mask?: number[] };

  export type BufferEncoding = "ascii" | "utf-8" | "binary";

  export interface IFileInfo {
    /**
     * File size in bytes
     */
    size?: number;
    /**
     * MIME-type of file
     */
    mimeType?: string;
    /**
     * File path
     */
    path?: string;
    /**
     * File URL
     */
    url?: string;
  }
  export interface IReadChunkOptions {
    /**
     * The offset in the buffer to start writing at; default is 0
     */
    offset?: number;
    /**
     * Number of bytes to read.
     */
    length?: number;
    /**
     * Position where to begin reading from the file.
     * Default it is `tokenizer.position`.
     * Position may not be less then `tokenizer.position`.
     */
    position?: number;
    /**
     * If set, will not throw an EOF error if not all of the requested data could be read
     */
    mayBeLess?: boolean;
  }
  /**
   * The tokenizer allows us to read or peek from the tokenizer-stream.
   * The tokenizer-stream is an abstraction of a stream, file or Buffer.
   */
  export interface ITokenizer {
    /**
     * Provide access to information of the underlying information stream or file.
     */
    fileInfo: IFileInfo;
    /**
     * Offset in bytes (= number of bytes read) since beginning of file or stream
     */
    position: number;
    /**
     * Peek (read ahead) buffer from tokenizer
     * @param buffer - Target buffer to fill with data peek from the tokenizer-stream
     * @param options - Read behaviour options
     * @returns Promise with number of bytes read
     */
    peekBuffer(
      buffer: Uint8Array,
      options?: IReadChunkOptions
    ): Promise<number>;
    /**
     * Peek (read ahead) buffer from tokenizer
     * @param buffer - Target buffer to fill with data peeked from the tokenizer-stream
     * @param options - Additional read options
     * @returns Promise with number of bytes read
     */
    readBuffer(
      buffer: Uint8Array,
      options?: IReadChunkOptions
    ): Promise<number>;
    /**
     * Peek a token from the tokenizer-stream.
     * @param token - Token to peek from the tokenizer-stream.
     * @param position - Offset where to begin reading within the file. If position is null, data will be read from the current file position.
     * @param maybeless - If set, will not throw an EOF error if the less then the requested length could be read.
     */
    peekToken<T>(
      token: IGetToken<T>,
      position?: number | null,
      maybeless?: boolean
    ): Promise<T>;
    /**
     * Read a token from the tokenizer-stream.
     * @param token - Token to peek from the tokenizer-stream.
     * @param position - Offset where to begin reading within the file. If position is null, data will be read from the current file position.
     */
    readToken<T>(token: IGetToken<T>, position?: number): Promise<T>;
    /**
     * Peek a numeric token from the stream
     * @param token - Numeric token
     * @returns Promise with number
     */
    peekNumber(token: IGetToken<number>): Promise<number>;
    /**
     * Read a numeric token from the stream
     * @param token - Numeric token
     * @returns Promise with number
     */
    readNumber(token: IGetToken<number>): Promise<number>;
    /**
     * Ignore given number of bytes
     * @param length - Number of bytes ignored
     */
    ignore(length: number): Promise<number>;
    /**
     * Clean up resources.
     * It does not close the stream for StreamReader, but is does close the file-descriptor.
     */
    close(): Promise<void>;
  }

  /**
   * Read-only token
   * See https://github.com/Borewit/strtok3 for more information
   */
  export interface IGetToken<Value, Array extends Uint8Array = Uint8Array> {
    /**
     * Length of encoded token in bytes
     */
    len: number;

    /**
     * Decode value from buffer at offset
     * @param array - Uint8Array to read the decoded value from
     * @param offset - Decode offset
     * @return decoded value
     */
    get(array: Array, offset: number): Value;
  }

  export interface IToken<Value, Array extends Uint8Array = Uint8Array>
    extends IGetToken<Value, Array> {
    /**
     * Encode value to buffer
     * @param array - Uint8Array to write the encoded value to
     * @param offset - Buffer write offset
     * @param value - Value to decode of type T
     * @return offset plus number of bytes written
     */
    put(array: Array, offset: number, value: Value): number;
  }
}
