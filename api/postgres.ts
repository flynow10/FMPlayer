import { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getPaginationOptions,
  getPrismaSelectPaginationOptions,
  printRequestType,
} from "../api-lib/api-utils.js";
import { prismaClient } from "../api-lib/data-clients.js";
import { PostgresRequest } from "@/src/types/postgres-request.js";
import { Prisma } from "@prisma/client";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json("Method not allowed");
    return;
  }

  if (typeof req.query.type !== "string" || req.query.type === "") {
    res.status(400).json("Missing type");
    return;
  }

  printRequestType("postgres", req.query.type);

  switch (req.query.type) {
    case "getTest": {
      res.status(200).json("Test");
      return;
    }

    case "getSong": {
      const { id } = req.query;

      if (typeof id !== "string") {
        res.status(400).json("Invalid id");
        return;
      }

      const song: PostgresRequest.SongWithRelations | null =
        await prismaClient.song.findUnique({
          where: {
            id,
          },
          include: {
            album: true,
            artists: true,
            featuring: true,
          },
        });

      if (!song) {
        res.status(404).json("Song not found");
        return;
      }

      res.status(200).json(song);
      return;
    }

    case "getAlbum": {
      const { id } = req.query;

      if (typeof id !== "string") {
        res.status(400).json("Invalid id");
        return;
      }

      const album: PostgresRequest.AlbumWithRelations | null =
        await prismaClient.album.findUnique({
          where: {
            id,
          },
          include: {
            songs: {
              orderBy: {
                trackNumber: "asc",
              },
            },
            artists: true,
            featuring: true,
          },
        });
      if (!album) {
        res.status(404).json("Album not found");
        return;
      }

      res.status(200).json(album);
      return;
    }

    case "getAlbumList": {
      const { sortBy } = req.query;
      const options: PostgresRequest.AlbumListOptions = {
        ...getPaginationOptions(req),
        sortBy: sortBy ? (sortBy as PostgresRequest.AlbumSortFields) : "title",
      };

      try {
        const albumList = await prismaClient.album.findMany({
          ...getPrismaSelectPaginationOptions(options, "title"),
          include: {
            songs: {
              orderBy: {
                trackNumber: "asc",
              },
            },
            artists: true,
            featuring: true,
          },
        });
        res.status(200).json(albumList);
      } catch (e) {
        console.error(e);
        res.status(400).json("Something went wrong when querying the database");
      }

      return;
    }

    case "getSongList": {
      const { sortBy } = req.query;
      const options: PostgresRequest.SongListOptions = {
        ...getPaginationOptions(req),
        sortBy: sortBy ? (sortBy as PostgresRequest.SongSortFields) : "title",
      };

      const selectQuery = {
        ...getPrismaSelectPaginationOptions(options, "title"),
        include: {
          album: true,
          artists: true,
          featuring: true,
        },
      };

      try {
        const songList = await prismaClient.song.findMany(selectQuery);
        res.status(200).json(songList);
      } catch (e) {
        console.error(e);
        res.status(400).json("Something went wrong when querying the database");
      }

      return;
    }

    case "getGenreMedia": {
      const { genre } = req.query;

      if (typeof genre !== "string") {
        res.status(400).json("Invalid genre");
        return;
      }

      const paginationOptions = getPaginationOptions(req);
      const options = {
        ...paginationOptions,
        genre,
      };

      const selectQuery = getPrismaSelectPaginationOptions(options, "title");

      const genreSongs = await prismaClient.song.findMany({
        where: {
          OR: [
            {
              album: {
                genre: options.genre,
              },
            },
            {
              genre: options.genre,
            },
          ],
        },
        ...selectQuery,
      });
      const genreAlbums = await prismaClient.album.findMany({
        where: {
          genre: options.genre,
        },
        include: {
          songs: {
            select: {
              id: true,
            },
          },
        },
        ...selectQuery,
      });

      res.status(200).json({ genre, songs: genreSongs, albums: genreAlbums });
      return;
    }

    case "getGenreList": {
      const genreResults = (
        await prismaClient.$queryRaw<
          { genre: string; song_count: bigint; album_count: bigint }[]
        >`select s1.genre, s1.count as song_count, coalesce(s2.count, 0) as album_count from (select genre, COUNT(*) from "Song" group by genre) s1 left join (select genre, COUNT(*) from "Album" group by genre) s2 on (s1.genre = s2.genre) union select s1.genre, coalesce(s2.count, 0) as song_count, s1.count as album_count from (select genre, COUNT(*) from "Album" group by genre) s1 left join (select genre, COUNT(*) from "Song" group by genre) s2 on (s1.genre = s2.genre) order by genre asc;`
      ).map<PostgresRequest.GenreListResponse>((obj) => ({
        genre: obj.genre,
        songCount: Number(obj.song_count),
        albumCount: Number(obj.album_count),
      }));
      res.status(200).json(genreResults);
      return;
    }

    case "getArtistList": {
      const { sortBy } = req.query;
      const options: PostgresRequest.ArtistListOptions = {
        ...getPaginationOptions(req),
        sortBy: sortBy ? (sortBy as PostgresRequest.ArtistSortFields) : "name",
      };

      const selectQuery: Prisma.ArtistFindManyArgs = {
        ...getPrismaSelectPaginationOptions(options, "name"),
        include: {
          _count: true,
        },
      };

      if (options.sortBy !== "id" && options.sortBy !== "name") {
        selectQuery.orderBy = [
          {
            [options.sortBy]: {
              _count: options.sortDirection,
            },
          },
          {
            name: options.sortDirection,
          },
        ];
      }

      try {
        const songList: PostgresRequest.ArtistListResponse =
          await prismaClient.artist.findMany(
            selectQuery as { include: { _count: true } }
          );
        res.status(200).json(songList);
      } catch (e) {
        console.error(e);
        res.status(400).json("Something went wrong when querying the database");
      }
      return;
    }

    default: {
      res.status(400).json("Invalid type");
      return;
    }
  }
}
