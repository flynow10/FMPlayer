import { ActionStub, createFromStub } from "../Actions/ActionTypes";
import { ID, ICoverImage } from "../Types";
import { Playlist } from "./Playlist";

export interface PlaylistJson {
  id: ID;
  title: string;
  coverUrl?: string;
  actionList: ActionStub[];
}

export class NamedPlaylist extends Playlist implements ICoverImage {
  public title: string;
  public coverUrl?: string;

  constructor() {
    super();
    this.title = "Missing title";
  }

  public static fromData(playlistData: PlaylistJson): NamedPlaylist {
    const playlist = new NamedPlaylist();
    if ("actionList" in playlistData) {
      playlist.addAction(
        ...playlistData.actionList.map((a) => createFromStub(a))
      );
    }
    delete (playlistData as any).actionList;
    return Object.assign(playlist, playlistData);
  }
}
