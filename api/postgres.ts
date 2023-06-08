import { VercelRequest, VercelResponse } from "@vercel/node";
import { getEnvVar, getVercelEnvironment } from "../lib/_constants.js";
import { PrismaClient, Song, Album } from "@prisma/client";
import {
  AlbumListOptions,
  AlbumSortFields,
  SongListOptions,
  SongSortFields,
  SortType,
} from "./_postgres-types.js";

const prismaDatasource =
  getVercelEnvironment() === "development"
    ? getEnvVar("DEVELOPMENT_DB_URL")
    : getEnvVar("POSTGRES_PRISMA_URL");
const prismaClient = new PrismaClient({
  datasources: { db: { url: prismaDatasource } },
});
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json("Method not allowed");
    return;
  }

  switch (req.query.type) {
    case "getSong": {
      const { id } = req.query;
      if (typeof id !== "string") {
        res.status(400).json("Invalid id");
        return;
      }

      const song = await prismaClient.song.findUnique({
        where: {
          id,
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

      const album = await prismaClient.album.findUnique({
        where: {
          id,
        },
        include: {
          songs: true,
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
      const { page, limit, sortBy, sort } = req.query;
      const options: AlbumListOptions = {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        sort: sort ? (sort as SortType) : "asc",
        sortBy: sortBy ? (sortBy as AlbumSortFields) : "title",
      };

      var defaultSort: any = {};

      if (options.sortBy !== "title") {
        defaultSort["title"] = options.sort;
      }

      try {
        const albumList = await prismaClient.album.findMany({
          skip: (options.page - 1) * options.limit,
          take: options.limit,
          orderBy: [
            {
              [options.sortBy]: options.sort,
            },
            defaultSort,
          ],
        });
        res.status(200).json(albumList);
      } catch (e) {
        console.error(e);
        res.status(400).json("Something went wrong when querying the database");
      }

      return;
    }

    case "getSongList": {
      const { page, limit, sort, sortBy } = req.query;
      const options: SongListOptions = {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        sort: sort ? (sort as SortType) : "asc",
        sortBy: sortBy ? (sortBy as SongSortFields) : "title",
      };

      var defaultSort: any = {};

      if (options.sortBy !== "title") {
        defaultSort["title"] = options.sort;
      }
      try {
        const songList = await prismaClient.song.findMany({
          skip: (options.page - 1) * options.limit,
          take: options.limit,
          orderBy: [
            {
              [options.sortBy]: options.sort,
            },
            defaultSort,
          ],
        });
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
