import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const testArtistId = "258a49b1-533c-4a24-9743-73bd4315917e";
const testTrackId = "abed96e9-ff44-4162-a78a-ff0436c67e34";

async function main() {
  prisma.artist.upsert({
    create: {
      id: testArtistId,
      name: "Test Artist",
    },
    where: {
      id: testArtistId,
    },
    update: {},
  });

  prisma.track.upsert({
    create: {
      id: testTrackId,
      title: "Test Track",
      genre: {
        connectOrCreate: {
          create: {
            name: "Test Genre",
          },
          where: {
            name: "Test Genre",
          },
        },
      },
      artists: {
        create: {
          artistType: "MAIN",
          artist: {
            connect: {
              id: testArtistId,
            },
          },
        },
      },
    },
    where: {
      id: testTrackId,
    },
    update: {},
  });
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
