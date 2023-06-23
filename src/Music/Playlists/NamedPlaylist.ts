import { ActionStub, createFromStub } from "@/Music/Actions/ActionTypes";
import { Playlist } from "./Playlist";

export interface PlaylistJson {
  id: string;
  title: string;
  coverUrl?: string;
  actionList: ActionStub[];
}

export class NamedPlaylist extends Playlist {
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
    delete (playlistData as any).actionList; // eslint-disable-line @typescript-eslint/no-explicit-any
    return Object.assign(playlist, playlistData);
  }
}
