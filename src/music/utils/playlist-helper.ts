import { PlaySongAction } from "@/src/music/actions/play-song-action";
import { Playlist } from "@/src/music/playlists/playlist";
import { Music } from "@/src/types/music";

export const PlaylistHelper = {
  getPlaylistFromTrackList(trackList: Music.HelperDB.ThinTrackList): Playlist {
    const playlist = new Playlist();
    trackList.trackConnections
      .sort((a, b) => a.trackNumber - b.trackNumber)
      .forEach((track) => {
        playlist.addAction(new PlaySongAction(track.trackId));
      });
    return playlist;
  },
};
