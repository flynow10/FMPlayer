import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";

const prisma = new PrismaClient();

type SongStub = {
  id: string;
  title: string;
};
async function main() {
  await prisma.song.deleteMany({});
  await prisma.album.deleteMany({});
  await prisma.artist.deleteMany({});
  await prisma.playlist.deleteMany({});

  const pianoGuysArtist = await prisma.artist.create({
    data: {
      name: "The Piano Guys",
    },
  });
  const pianoGuysAlbum = await prisma.album.create({
    data: {
      id: uuid(),
      title: "The Piano Guys",
      artists: {
        connect: {
          id: pianoGuysArtist.id,
        },
      },
      genre: "Classical",
    },
  });
  const pianoGuysAlbumSongs: SongStub[] = [
    {
      id: "b0820e12-4582-4b9f-bd19-3c29d30b64c4",
      title: "Titanium / Pavane",
    },
    {
      id: "674434a9-8e12-4229-a443-c15ee8aab019",
      title: "Peponi (Paradise)",
    },
    {
      id: "38624a48-69d9-4be7-972b-82ddc7a71a33",
      title: "Code Name Vivaldi",
    },
    {
      id: "34c9a9a5-cabe-44c3-a7cb-e5ca7d5082ef",
      title: "Beethoven's 5 Secrets",
    },
    {
      id: "11480307-5d38-4b11-9cab-933373ffaa10",
      title: "Over the Rainbow / Simple Gifts",
    },
    {
      id: "1455b086-2c52-46ab-bccc-99c8f8c6f9a6",
      title: "Cello Wars",
    },
    {
      id: "0c90ce5c-31e7-4b4e-9729-e3cc646e9f81",
      title: "Arwen's Vigil",
    },
    {
      id: "58bb7c76-04b4-40f8-a7b0-026b094bad22",
      title: "Moonlight",
    },
    {
      id: "be9fdb90-6242-4d4d-a2f1-1b4adbfc8279",
      title: "A Thousand Years",
    },
    {
      id: "fdbe24dc-3fe7-41c7-a665-41271d29a68b",
      title: "Michael Meets Mozart",
    },
    {
      id: "a1aa94cd-edd8-4f73-b98c-51be8196015e",
      title: "The Cello Song",
    },
    {
      id: "a30102d0-1006-4f9e-9fd4-c63c5318e879",
      title: "Rolling in the Deep",
    },
    {
      id: "aaa24e58-36a7-45d6-b16a-1fbbec320421",
      title: "What Makes You Beautiful",
    },
    {
      id: "d717320d-28b2-4d39-ac98-6024fe2c67c7",
      title: "Bring Him Home",
    },
    {
      id: "4752277b-42ac-4908-9c8f-1b1f7ee18e14",
      title: "Without You",
    },
    {
      id: "c94394ea-0371-4ea3-b801-5cb184f0a215",
      title: "Nearer My God to Thee",
    },
  ];
  for (let i = 0; i < pianoGuysAlbumSongs.length; i++) {
    const song = pianoGuysAlbumSongs[i];

    await prisma.song.create({
      data: {
        id: song.id,
        title: song.title,
        album: {
          connect: {
            id: pianoGuysAlbum.id,
          },
        },
        genre: "Classical",
        artists: {
          connect: {
            id: pianoGuysArtist.id,
          },
        },
        audioUploaded: new Date(),
        trackNumber: i + 1,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
