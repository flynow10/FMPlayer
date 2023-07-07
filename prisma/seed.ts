import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const albumId = "ae18c530-d9e0-4130-8645-3ab032ff8431";
  const bestOfBootieAlbum = await prisma.album.upsert({
    where: {
      id: albumId,
    },
    update: {},
    create: {
      id: albumId,
      title: "Best of Bootie Mashup 2022",
    },
  });
  const bestOfBootieSongs: { id: string; title: string; artists: string[] }[] =
    [
      {
        id: "a8f3a856-9cbf-417d-a859-e1dc0ff3efbd",
        title: "Best of Bootie Mashup Intro 2022",
        artists: ["Lewis Wake"],
      },
      {
        id: "d98209dc-ba61-463d-9462-3773c9edfd0b",
        title: "My Own Worst Anti-Hero",
        artists: ["Adriana A"],
      },
      {
        id: "d185130f-9ad4-4a98-8f23-a219288d99b5",
        title: "About The Damn End",
        artists: ["DJ Cummerbund"],
      },
      {
        id: "35a3da7f-4d0e-425d-8f08-a9e72fe1f733",
        title: "Feeling Big Energy",
        artists: ["Satis5d"],
      },
      {
        id: "ffc30d08-37c9-4e2a-a45c-51db98dc3be9",
        title: "We Don't Talk About Backstreet",
        artists: ["Titus Jones"],
      },
      {
        id: "fa414131-9669-4776-a585-65c0c0ecd81f",
        title: "Summer Up That Hill",
        artists: ["iWillBattle"],
      },
      {
        id: "fa1f8d71-0f7f-4dde-9018-a317f26203a7",
        title: "Break My Lights",
        artists: ["Girl Talk"],
      },
      {
        id: "b5166a99-90f6-481a-9234-405ae0be649c",
        title: "Bulletproof Feels",
        artists: ["PDS MIX"],
      },
    ];
  for (let i = 0; i < bestOfBootieSongs.length; i++) {
    const songData = bestOfBootieSongs[i];
    const trackNumber = i + 1;
    await prisma.song.upsert({
      where: {
        id: songData.id,
      },
      update: {},
      create: {
        id: songData.id,
        title: songData.title,
        artists: songData.artists,
        albumId: bestOfBootieAlbum.id,
        trackNumber: trackNumber,
        genre: "Mashup",
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
