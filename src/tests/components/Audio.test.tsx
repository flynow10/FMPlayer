import { Audio } from "@/components/Audio";
import { Song } from "@prisma/client";
import { getByText } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import { render } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { v4 } from "uuid";

jest.mock("@/Music/Library/MusicLibrary", () => ({
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
    await waitFor(() => {
      expect(document.getElementById("song-title")?.textContent).toBe(
        "Test song"
      );
    });
  });
});
