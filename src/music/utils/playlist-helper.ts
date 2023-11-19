import { PlaySongAction } from "@/src/music/actions/play-song-action";
import { Playlist } from "@/src/music/playlists/playlist";
import { Music } from "@/src/types/music";

export const PlaylistHelper = {
  getPlaylistFromTrackList(trackList: Music.HelperDB.ThinTrackList): Playlist {
    const playlist = new Playlist().addAction(
      ...trackList.trackConnections
        .sort((a, b) => a.trackNumber - b.trackNumber)
        .map((trackConn) => new PlaySongAction(trackConn.trackId))
    );
    return playlist;
  },
};
