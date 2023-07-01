import { FileType } from "@/src/types/file-type";
import { Song } from "@prisma/client";

export namespace Music {
  export namespace Files {
    export type PreUploadFile = {
      audioData: AudioData;
    } & EditableFile;
    export type EditableFile = {
      metadata: EditableMetadata;
    };
    export type AudioData = {
      fileType: FileType.FileTypeResult;
      buffer: Uint8Array;
    };

    export type EditableMetadata = Omit<Song, "modifiedOn" | "createdOn">;
  }

  export type ActionType =
    | "play song"
    | "number"
    | "loop"
    | "end loop"
    | "condition"
    | "end condition";

  export type MediaType = "song" | "album" | "playlist";

  export type RepeatMode = "none" | "one" | "all";

  export type SongEndBehavior = "stop" | "play";

  export type AudioEvent = () => void;

  export type ActionStub = {
    type: ActionType;
    data: string;
  };
}
