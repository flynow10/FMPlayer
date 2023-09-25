import { Audio } from "@/src/components/layout/Audio";
import { Music } from "@/src/types/music";
import { waitFor } from "@testing-library/react";
import { render } from "@testing-library/react";

jest.mock("@/src/hooks/use-audio-player", () => {
  return {
    useAudioPlayer: () => {
      return {
        ...jest.requireActual("@/src/hooks/use-audio-player").useAudioPlayer(),
        useCurrentTrackId: () => {
          return "";
        },
      };
    },
  };
});

jest.mock("@/src/music/library/music-library", () => ({
  MusicLibrary: {
    db: {
      album: {
        get: jest.fn(async (): Promise<null> => {
          return null;
        }),
      },
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
        onClickArtist={() => {
          return;
        }}
      />
    );
    await waitFor(() => {
      expect(document.getElementById("song-title")?.textContent).toBe(
        "Test track"
      );
    });
  });
});
