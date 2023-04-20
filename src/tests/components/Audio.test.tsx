import { Song } from "@/Music/Song";
import { MediaType } from "@/Music/Types";
import { Audio } from "@/components/Audio";
import { render } from "@testing-library/react";
import { v4 } from "uuid";

jest.mock("@/Music/MusicLibrary", () => ({
  MyMusicLibrary: {
    getSong: jest.fn(
      (id: string): Song => ({
        duration: 1000,
        id,
        title: "Test song",
        fileType: "mp3",
        album: v4(),
        getMediaType: () => MediaType.Song,
      })
    ),
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
