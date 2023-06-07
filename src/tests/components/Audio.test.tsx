import { Audio } from "@/components/Audio";
import { Song } from "@prisma/client";
import { render } from "@testing-library/react";
import { v4 } from "uuid";

jest.mock("@/Music/MusicLibrary", () => ({
  MyMusicLibrary: {
    getSong: jest.fn((id: string): Promise<Song> => {
      return new Promise((r) =>
        r({
          id,
          title: "Test song",
          albumId: v4(),
          artists: [],
          featuring: [],
          genre: "Test",
          trackNumber: 1,
          createdOn: new Date(),
          modifiedOn: new Date(),
        })
      );
    }),
  },
}));

describe("<Audio/>", () => {
  test("renders", async () => {
    render(
      <Audio
        id={v4()}
        currentTime={0}
        duration={0}
        loaded={true}
        percentLoaded={0}
        playing={false}
        repeatMode="none"
      />
    );
  });
});
