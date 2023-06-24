import { AlbumWithSongs } from "@/api-lib/postgres-types";
import { PlaySongAction } from "@/src/music/actions/play-song-action";
import { Playlist } from "@/src/music/playlists/playlist";

export const PlaylistHelper = {
  getPlaylistFromAlbum(album: AlbumWithSongs): Playlist {
    const playlist = new Playlist();
    album.songs.forEach((song) => {
      playlist.addAction(new PlaySongAction(song.id));
    });
    return playlist;
  },
};
