import { prismaClient } from "@/api-lib/data-clients";

import { Prisma } from "@prisma/client";

export const USER_TOKEN = "access-token";

export const DEFAULT_PAGE_LIMIT = 2e9;

export const REFRESH_TOKEN_EXPIRATION = 7 * 24 * 60;

export function getJwtSecretKey(): string {
  return getEnvVar("JWT_SECRET_KEY");
}

export type VercelEnv = "development" | "preview" | "production";

export function getVercelEnvironment(): VercelEnv {
  return getEnvVar("VERCEL_ENV") as VercelEnv;
}

export function getEnvVar(variableName: string, defaultValue?: string): string {
  const environmentVariable = process.env[variableName];
  if (environmentVariable === undefined || environmentVariable.length === 0) {
    if (defaultValue === undefined) {
      throw new Error(`The environment variable ${variableName} is not set.`);
    } else {
      return defaultValue;
    }
  }
  return environmentVariable;
}

export type ModelSymbol = Exclude<
  keyof typeof prismaClient,
  `$${string}` | symbol | "session"
>;

export type Include<S extends ModelSymbol> = Prisma.Args<
  (typeof prismaClient)[S],
  "findUnique"
>["include"];

export function getIncludes<S extends ModelSymbol>(
  modelName: S
): Include<S> | null {
  return (
    {
      album: {
        artists: {
          include: {
            artist: true,
          },
        },
        artwork: true,
        genre: true,
        tags: true,
        trackList: {
          include: {
            trackConnections: {
              orderBy: {
                trackNumber: "asc",
              },
              include: {
                track: true,
              },
            },
          },
        },
      },
      albumArtist: {
        album: true,
        artist: true,
      },
      artist: {
        albums: {
          include: {
            album: true,
          },
        },
        tracks: {
          include: {
            track: true,
          },
        },
      },
      artwork: {
        albums: true,
        functions: true,
        playlists: true,
        tracks: true,
      },
      audioSource: {
        track: true,
      },
      function: {
        artwork: true,
        tags: true,
      },
      genre: {
        albums: {
          include: {
            artists: {
              include: {
                artist: true,
              },
            },
            artwork: true,
          },
        },
        tracks: {
          include: {
            artists: {
              include: {
                artist: true,
              },
            },
            artwork: true,
          },
        },
      },
      playlist: {
        artwork: true,
        tags: true,
        trackList: {
          include: {
            trackConnections: {
              orderBy: {
                trackNumber: "asc",
              },
              include: {
                track: true,
              },
            },
          },
        },
      },
      tag: {
        albums: true,
        functions: true,
        playlists: true,
        tagType: true,
        tracks: true,
      },
      tagType: {
        tags: true,
      },
      track: {
        artists: {
          include: {
            artist: true,
          },
        },
        artwork: true,
        audioSource: true,
        genre: true,
        listConnections: {
          include: {
            trackList: {
              include: {
                album: true,
                playlist: true,
              },
            },
          },
        },
        tags: true,
      },
      trackArtist: {
        artist: true,
        track: true,
      },
      trackInList: {
        track: true,
        trackList: true,
      },
      trackList: {
        album: true,
        playlist: true,
        trackConnections: {
          orderBy: {
            trackNumber: "asc",
          },
          include: {
            track: true,
          },
        },
      },
    } as { [Key in ModelSymbol]: Include<Key> }
  )?.[modelName];
}
