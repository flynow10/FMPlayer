import { PreUploadSong } from "@/src/components/pages/upload/FileUpload";
import { PostgresRequest } from "@/src/types/postgres-request";
import { fileTypeFromBuffer } from "@/src/utils/file-type";
import { getTags, pullMetaDataFromTags } from "@/src/utils/media-tags";
import { v4 as uuid } from "uuid";

// https://github.com/ffmpegwasm/ffmpeg.wasm/blob/master/src/browser/fetchFile.js
const readFromBlobOrFile = (blob: File | Blob): Promise<ArrayBuffer> =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = () => {
      if (fileReader.result !== null && typeof fileReader.result !== "string") {
        resolve(fileReader.result);
      } else {
        reject(Error('File could not be read! Error="result was null"'));
      }
    };

    fileReader.onerror = ({ target }) => {
      if (target !== null) {
        reject(Error(`File could not be read! Error="${target.error}"`));
      }
    };

    fileReader.readAsArrayBuffer(blob);
  });

// eslint-disable-next-line
export const fetchFile = async (_data: string | Buffer | File | Blob) => {
  let data: ArrayBufferLike | ArrayLike<number>;

  if (typeof _data === "undefined") {
    return new Uint8Array();
  }

  if (typeof _data === "string") {
    /* From base64 format */
    if (/data:_data\/([a-zA-Z]*);base64,([^"]*)/.test(_data)) {
      data = window
        .atob(_data.split(",")[1])
        .split("")
        .map((c) => c.charCodeAt(0));
      /* From remote server/URL */
    } else {
      const res = await fetch(new URL(_data, import.meta.url).href);
      data = await res.arrayBuffer();
    }
    /* From Blob or File */
  } else if (_data instanceof File || _data instanceof Blob) {
    data = await readFromBlobOrFile(_data);
  } else {
    data = _data;
  }

  return new Uint8Array(data);
};

export const getPreUploadSongFromData = async (
  data: Uint8Array,
  fileName = "Untitled Song"
): Promise<PreUploadSong> => {
  const fileType = await fileTypeFromBuffer(data);
  const tags = await getTags(data);
  let metadata: PostgresRequest.SongMetadata = {};

  if (tags !== null) {
    metadata = pullMetaDataFromTags(tags);
  }

  if (metadata.title === undefined) {
    metadata.title = fileName;
  }

  if (fileType === undefined) {
    throw new Error("Failed to extract file type from uploaded data");
  }

  return {
    tempId: uuid(),
    data,
    file: fileType,
    metadata,
  };
};
