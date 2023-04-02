import classNames from "classnames";
import { EndLoopAction, LoopAction } from "./Music/Actions/LoopAction";
import { PlaySongAction } from "./Music/Actions/PlaySongAction";
import { MyMusicLibrary } from "./Music/MusicLibrary";
import { Playlist } from "./Music/Playlists/Playlist";

export type QueueProps = {
  playlist: Playlist;
  currentSongIndex: number;
};

export function Queue(props: QueueProps) {
  const currentAction =
    props.playlist.songList[props.currentSongIndex]?.actionId;
  var indent = 0;
  // ml-[0px]
  // ml-[10px]
  // ml-[20px]
  // ml-[30px]
  // ml-[40px]
  // ml-[50px]
  // ml-[60px]
  const indentClass = (oneLess: boolean = false) =>
    `ml-[${10 * (indent + -1 * Number(oneLess))}px]`;

  const createPlaySongDisplay = (playSongAction: PlaySongAction) => {
    const classes = classNames(indentClass(), {
      "text-blue-600": playSongAction.id === currentAction,
    });
    const song = MyMusicLibrary.getSong(playSongAction.songId);
    return (
      <div className={classes} key={playSongAction.id}>
        Play Song {song?.title ?? "Unknown Song"}
      </div>
    );
  };

  const actions = props.playlist.actionList.map((action) => {
    if (action instanceof PlaySongAction) {
      return createPlaySongDisplay(action);
    }
    if (action instanceof LoopAction) {
      indent++;
      return (
        <div key={action.id} className={indentClass(true)}>
          Loop {action.count} times:
        </div>
      );
    }
    if (action instanceof EndLoopAction) {
      indent--;
      return (
        <div key={action.id} className={indentClass()}>
          End Loop
        </div>
      );
    }
  });
  return <div className="flex flex-col">{actions}</div>;
}
