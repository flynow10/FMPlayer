import { ActionStub, createFromStub } from "../Actions/ActionTypes";
import { ID } from "../Types";
import { Playlist } from "./Playlist";

export interface PlaylistJson {
  id: ID;
  title: string;
  actionList: ActionStub[];
}

export class NamedPlaylist extends Playlist {
  public title: string;

  constructor() {
    super();
    this.title = "Missing title";
  }

  public static fromData(playlistData: PlaylistJson): Playlist {
    const playlist = new Playlist();
    if ("actionList" in playlistData) {
      playlist.addAction(
        ...playlistData.actionList.map((a) => createFromStub(a))
      );
    }
    delete (playlistData as any).actionList;
    return Object.assign(playlist, playlistData);
  }
}
