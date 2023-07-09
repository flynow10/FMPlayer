import { PlaySongAction } from "@/src/music/actions/play-song-action";
import { Playlist } from "@/src/music/playlists/playlist";
import { PostgresRequest } from "@/src/types/postgres-request";

export const PlaylistHelper = {
  getPlaylistFromAlbum(album: PostgresRequest.AlbumWithRelations): Playlist {
    const playlist = new Playlist();
    album.songs.forEach((song) => {
      playlist.addAction(new PlaySongAction(song.id));
    });
    return playlist;
  },
};
