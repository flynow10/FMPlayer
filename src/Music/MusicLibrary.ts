import Ajv, { JSONSchemaType } from "ajv";
import addFormats from "ajv-formats";
import { PlaySongAction } from "./Actions/PlaySongAction";
import { Album, AlbumJson } from "./Album";
import { NamedPlaylist, PlaylistJson } from "./Playlists/NamedPlaylist";
import { Playlist } from "./Playlists/Playlist";
import { Song, SongJson } from "./Song";
import { ID } from "./Types";
import { IS_LOCAL } from "@/utils/dev";

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
            enum: ["mp3", "webm", "m4a"],
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
    coverUrl: {
      type: "string",
      nullable: true,
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
  protected _playlists: { [key: ID]: NamedPlaylist } = {};

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

  public getAlbumSongs(album: Album): Song[] {
    return album.songs
      .map((id) => MyMusicLibrary.getSong(id))
      .filter<Song>((song): song is Song => {
        return song !== null;
      });
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

  public getAllPlaylists(): NamedPlaylist[] {
    return Object.values(this._playlists);
  }

  public abstract loadLibraryData(): Promise<MusicLibraryJson>;
  public abstract loadPlaylistData(playlistId: ID): Promise<PlaylistJson>;

  public loadLibrary() {
    new Promise<void>(async (resolve, reject) => {
      var libraryData;
      try {
        libraryData = await this.loadLibraryData();
      } catch (e) {
        return reject(e);
      }

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
        try {
          const playlistData = await this.loadPlaylistData(playlistId);
          this._playlists[playlistData.id] =
            NamedPlaylist.fromData(playlistData);
        } catch (e) {
          console.warn(e);
        }
      }
      resolve();
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

  public abstract getSongUrl(songId: ID): string | null;

  public exportJson(): string {
    return JSON.stringify(this);
  }
}

export interface Authenticatable {
  isAuthenticated(): boolean;
  tryLoadAuth(): Promise<boolean>;
  authenticate(key: string): Promise<boolean>;
  getAuthorizedRequest(url: string, options?: RequestInit): RequestInfo;
}

export function isAuthenticatable(object: any): object is Authenticatable {
  const props = [
    "isAuthenticated",
    "tryLoadAuth",
    "authenticate",
    "getAuthorizedRequest",
  ];
  return props.every((prop) => prop in object);
}

class LocalTestingLibrary extends MusicLibrary implements Authenticatable {
  public jwt: string | null = null;

  constructor() {
    super();
  }

  isAuthenticated(): boolean {
    return this.jwt !== null;
  }

  public async tryLoadAuth(): Promise<boolean> {
    const token = localStorage.getItem("jwt");
    if (token) {
      this.jwt = token;
    }
    const isValid = await (
      await fetch(this.getAuthorizedUrl("http://localhost:3000/isValid"))
    ).json();
    if (!isValid) {
      this.jwt = null;
    }
    return isValid;
  }

  public async authenticate(password: string): Promise<boolean> {
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

  public getAuthorizedUrl(url: string): string {
    const authString = "p=" + this.jwt;
    return url + (url.indexOf("?") === -1 ? "?" : "&") + authString;
  }

  public getAuthorizedRequest(url: string, options?: RequestInit): RequestInfo {
    return new Request(this.getAuthorizedUrl(url), options);
  }

  public async loadLibraryData(): Promise<MusicLibraryJson> {
    const ajv = addFormats(new Ajv());
    const validateLibrary = ajv.compile(MusicLibrarySchema);
    const data = await (
      await fetch(
        this.getAuthorizedRequest("http://localhost:3000/static/library.json")
      )
    ).json();
    if (validateLibrary(data)) {
      return data;
    }
    throw new Error("Loaded library data was not formatted correctly!");
  }

  public async loadPlaylistData(playlistId: string): Promise<PlaylistJson> {
    const ajv = addFormats(new Ajv());
    const validatePlaylist = ajv.compile(PlaylistSchema);
    const data = await (
      await fetch(
        this.getAuthorizedRequest(
          `http://localhost:3000/static/Playlists/${playlistId}.json`
        )
      )
    ).json();
    if (validatePlaylist(data)) {
      return data;
    }
    throw new Error("Loaded playlist data was not formatted correctly!");
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

class DummyLibrary extends MusicLibrary {
  public async loadLibraryData(): Promise<MusicLibraryJson> {
    return {
      albums: [],
      playlists: [],
      songs: [],
    };
  }

  public async loadPlaylistData(playlistId: string): Promise<PlaylistJson> {
    return {
      id: "",
      title: "",
      actionList: [],
    };
  }

  public getSongUrl(songId: string): string | null {
    return "";
  }
}

export const MyMusicLibrary: MusicLibrary = IS_LOCAL
  ? new LocalTestingLibrary()
  : new DummyLibrary();
