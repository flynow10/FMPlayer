import { AlbumWithSongs } from "@/lib/_postgres-types";
import { PlaySongAction } from "@/Music/Actions/PlaySongAction";
import { Playlist } from "@/Music/Playlists/Playlist";

export const PlaylistHelper = {
  getPlaylistFromAlbum(album: AlbumWithSongs): Playlist {
    const playlist = new Playlist();
    album.songs.forEach((song) => {
      playlist.addAction(new PlaySongAction(song.id));
    });
    return playlist;
  },
};
