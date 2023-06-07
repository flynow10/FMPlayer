import { Action } from "@/Music/Actions/Action";
import { EndLoopAction, LoopAction } from "@/Music/Actions/LoopAction";
import { NumberAction } from "@/Music/Actions/NumberAction";
import { PlaySongAction } from "@/Music/Actions/PlaySongAction";
import { ActionSongPair } from "@/Music/Playlists/Playlist";
import { PlaylistParser } from "@/Music/Playlists/PlaylistParser";

describe("PlaylistParser", () => {
  const parser = new PlaylistParser();
  it("parses an empty list", () => {
    expect(parser.parse([])).toBeArray().toBeEmpty();
  });

  it("parses a list of songs", () => {
    const actionList = [];

    for (let i = 0; i < 10; i++) {
      const action = new PlaySongAction(`test-song-id-${i}`);
      action.id = `test-action-id-${i}`;
      actionList.push(action);
    }

    expect(parser.parse(actionList)).toIncludeAllMembers(
      actionList.map<ActionSongPair>((action) => ({
        actionId: action.id,
        songId: action.songId,
      }))
    );
  });

  it("parses a song loop", () => {
    const actionList = [];

    actionList.push(new LoopAction());
    actionList.push(new NumberAction(3));

    const songAction = new PlaySongAction("test-song-id");
    songAction.id = "test-action-id";
    actionList.push(songAction);

    actionList.push(new EndLoopAction());

    expect(parser.parse(actionList)).toIncludeAllMembers(
      ["", "", ""].map<ActionSongPair>(() => ({
        actionId: songAction.id,
        songId: songAction.songId,
      }))
    );
  });
  it("fails to parse a free number", () => {
    const actionList: Action[] = [];
    actionList.push(new NumberAction(3));

    expect(() => {
      parser.parse(actionList);
    }).toThrow();
  });
});
