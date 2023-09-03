import { PlaySongAction } from "@/src/music/actions/play-song-action";
import { Playlist } from "@/src/music/playlists/playlist";
import { Music } from "@/src/types/music";

export const PlaylistHelper = {
  getPlaylistFromAlbum(album: Music.DB.TableType<"Album">): Playlist {
    const playlist = new Playlist();
    album.trackList.trackConnections.forEach((track) => {
      playlist.addAction(new PlaySongAction(track.trackId));
    });
    return playlist;
  },
};
