import Ajv, { JSONSchemaType } from "ajv";
import addFormats from "ajv-formats";
import { PlaySongAction } from "./Actions/PlaySongAction";
import { Album, AlbumJson } from "./Album";
import { NamedPlaylist, PlaylistJson } from "./Playlists/NamedPlaylist";
import { Playlist } from "./Playlists/Playlist";
import { Song, SongJson } from "./Song";
import { ID } from "./Types";

interface MusicLibraryJson {
  songs: SongJson[];
  albums: AlbumJson[];
  playlists: ID[];
}

const MusicLibrarySchema: JSONSchemaType<MusicLibraryJson> = {
  type: "object",
  properties: {
    albums: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
          },
          artists: {
            type: "array",
            items: {
              type: "string",
            },
            nullable: true,
          },
          coverUrl: {
            type: "string",
            nullable: true,
          },
          featuring: {
            type: "array",
            items: {
              type: "string",
            },
            nullable: true,
          },
          songs: {
            type: "array",
            items: {
              type: "string",
              format: "uuid",
            },
          },
          title: {
            type: "string",
          },
        },
        required: ["id", "songs", "title"],
      },
    },
    songs: {
      type: "array",
      items: {
        type: "object",
        properties: {
          album: {
            type: "string",
            format: "uuid",
            nullable: true,
          },
          artists: {
            type: "array",
            items: {
              type: "string",
            },
            nullable: true,
          },
          coverUrl: {
            type: "string",
            nullable: true,
          },
          duration: {
            type: "integer",
          },
          featuring: {
            type: "array",
            items: {
              type: "string",
            },
            nullable: true,
          },
          fileType: {
            type: "string",
            enum: ["mp3", "webm"],
          },
          id: {
            type: "string",
            format: "uuid",
          },
          title: {
            type: "string",
          },
          trackNumber: {
            type: "integer",
            nullable: true,
          },
        },
        required: ["id", "fileType", "title", "duration"],
      },
    },
    playlists: {
      type: "array",
      items: {
        type: "string",
        format: "uuid",
      },
    },
  },
  required: ["albums", "songs", "playlists"],
};

const PlaylistSchema: JSONSchemaType<PlaylistJson> = {
  type: "object",
  properties: {
    id: {
      type: "string",
    },
    title: {
      type: "string",
    },
    actionList: {
      type: "array",
      items: {
        type: "object",
        properties: {
          data: {
            type: "string",
          },
          type: {
            type: "integer",
          },
        },
        required: ["data", "type"],
      },
    },
  },
  required: ["id", "title", "actionList"],
};

abstract class MusicLibrary {
  protected _loaded = false;
  public get loaded() {
    return this._loaded;
  }
  public onLoaded: (() => void)[] = [];
  protected _songs: { [key: ID]: Song } = {};
  protected _albums: { [key: ID]: Album } = {};
  protected _playlists: { [key: ID]: Playlist } = {};

  public getSong(id: ID): Song | null {
    if (id in this._songs) {
      return this._songs[id];
    }
    return null;
  }

  public getAllSongs(): Song[] {
    return Object.values(this._songs);
  }

  public getAlbum(id: ID): Album | null {
    if (id in this._albums) {
      return this._albums[id];
    }
    return null;
  }

  public getPlaylistFromAlbum(album: Album): Playlist {
    const playlist = new Playlist();
    for (let i = 0; i < album.songs.length; i++) {
      const songId = album.songs[i];
      playlist.addAction(new PlaySongAction(songId));
    }
    return playlist;
  }

  public getAllAlbums(): Album[] {
    return Object.values(this._albums);
  }

  public getPlaylist(id: ID): Playlist | null {
    if (id in this._playlists) {
      return this._playlists[id];
    }
    return null;
  }

  public getAllPlaylists(): Playlist[] {
    return Object.values(this._playlists);
  }

  public abstract loadLibraryData(): Promise<any>;
  public abstract loadPlaylistData(playlistId: ID): Promise<any>;

  public loadLibrary() {
    new Promise<void>(async (resolve, reject) => {
      const libraryData = await this.loadLibraryData();
      const ajv = addFormats(new Ajv());
      const validateLibrary = ajv.compile(MusicLibrarySchema);
      const validatePlaylist = ajv.compile(PlaylistSchema);

      if (validateLibrary(libraryData)) {
        for (let i = 0; i < libraryData.songs.length; i++) {
          const songData = libraryData.songs[i];
          const song = Song.fromData(songData);
          this._songs[song.id] = song;
        }

        for (let i = 0; i < libraryData.albums.length; i++) {
          const albumData = libraryData.albums[i];
          const album = Album.fromData(albumData);
          this._albums[album.id] = album;
        }
        for (let i = 0; i < libraryData.playlists.length; i++) {
          const playlistId = libraryData.playlists[i];
          const playlistData = await this.loadPlaylistData(playlistId);
          if (validatePlaylist(playlistData)) {
            this._playlists[playlistData.id] =
              NamedPlaylist.fromData(playlistData);
          }
        }
        resolve();
      } else {
        reject();
      }
    })
      .then(() => {
        this._loaded = true;
        this.onLoaded.forEach((listener) => {
          listener();
        });
      })
      .catch((error) => {
        console.error("Failed to load Music Library");
        if (error) {
          throw error;
        }
      });
  }

  public exportJson(): string {
    return JSON.stringify(this);
  }
}

class FileBasedLibrary extends MusicLibrary {
  public jwt: string | null = null;

  constructor() {
    super();
  }

  public async tryLoadToken(): Promise<boolean> {
    const token = localStorage.getItem("jwt");
    if (token) {
      this.jwt = token;
    }
    const isValid = await (
      await fetch(this.getAuthorizedUrl("http://localhost:3000/isValid"))
    ).json();
    return isValid;
  }

  public async authenticateUser(password: string): Promise<boolean> {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });
    const json = await response.json();
    if (!json) {
      return false;
    }
    this.jwt = json.token;
    localStorage.setItem("jwt", json.token);
    return true;
  }
  public getAuthorizedUrl(unauthURL: string): string {
    const authString = "p=" + this.jwt;
    if (unauthURL.indexOf("?") === -1) {
      return unauthURL + "?" + authString;
    } else {
      return unauthURL + "&" + authString;
    }
  }

  public async loadLibraryData(): Promise<any> {
    return await (
      await fetch(
        this.getAuthorizedUrl("http://localhost:3000/static/library.json")
      )
    ).json();
  }
  public async loadPlaylistData(playlistId: string): Promise<any> {
    return await (
      await fetch(
        this.getAuthorizedUrl(
          `http://localhost:3000/static/Playlists/${playlistId}.json`
        )
      )
    ).json();
  }
  public getSongUrl(id: ID): string | null {
    if (id in this._songs) {
      return this.getAuthorizedUrl(
        `http://localhost:3000/static/Songs/${id}.${this._songs[id].fileType}`
      );
    }
    return null;
  }
}

export const MyMusicLibrary = new FileBasedLibrary();
