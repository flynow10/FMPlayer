import { Audio } from "@/src/components/layout/Audio";
import { Music } from "@/src/types/music";
import { waitFor } from "@testing-library/react";
import { render } from "@testing-library/react";
import { v4 } from "uuid";

jest.mock("@/src/music/library/music-library", () => ({
  MusicLibrary: {
    db: {
      track: {
        get: jest.fn(
          ({ id }: { id: string }): Promise<Music.DB.TableType<"Track">> => {
            return new Promise((r) =>
              r({
                id,
                title: "Test track",
                artists: [],
                genre: {
                  id: "",
                  name: "Test Genre",
                  createdOn: new Date(),
                  modifiedOn: new Date(),
                },
                artwork: null,
                artworkId: null,
                audioSource: null,
                genreId: "",
                listConnections: [],
                tags: [],
                createdOn: new Date(),
                modifiedOn: new Date(),
              })
            );
          }
        ),
      },
    },
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
        "Test track"
      );
    });
  });
});
