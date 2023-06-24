import { AlbumWithSongs } from "api-lib/_postgres-types";
import { PlaySongAction } from "@/src/music/actions/PlaySongAction";
import { Playlist } from "@/src/music/playlists/Playlist";

export const PlaylistHelper = {
  getPlaylistFromAlbum(album: AlbumWithSongs): Playlist {
    const playlist = new Playlist();
    album.songs.forEach((song) => {
      playlist.addAction(new PlaySongAction(song.id));
    });
    return playlist;
  },
};
