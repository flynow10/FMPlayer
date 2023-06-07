import Ajv, { JSONSchemaType } from "ajv";
import { NamedPlaylist, PlaylistJson } from "./Playlists/NamedPlaylist";

const PlaylistSchema: JSONSchemaType<PlaylistJson> = {
  type: "object",
  properties: {
    id: {
      type: "string",
    },
    title: {
      type: "string",
    },
    coverUrl: {
      type: "string",
      nullable: true,
    },
    actionList: {
      type: "array",
      items: {
        type: "object",
        properties: {
          data: {
            type: "string",
          },
          type: {
            type: "integer",
          },
        },
        required: ["data", "type"],
      },
    },
  },
  required: ["id", "title", "actionList"],
};
