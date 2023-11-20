import { useAudioPlayer } from "@/src/hooks/use-audio-player";
import { useMediaContext } from "@/src/hooks/use-media-context";
import { Music } from "@/src/types/music";
import { Play } from "lucide-react";

type OrderedTrackListProps = {
  list: Music.HelperDB.ThinTrackList;
};

export default function OrderedTrackList(props: OrderedTrackListProps) {
  const audioPlayer = useAudioPlayer();
  const { show: showTrackMenu } = useMediaContext("track");
  return (
    <div className="flex flex-col w-full">
      {props.list.trackConnections.map((connection, index) => (
        <div
          key={index}
          className="flex border-t-2 last:border-b-2 p-2 gap-4 group"
          onContextMenu={(event) => {
            showTrackMenu({
              event,
              props: {
                trackId: connection.trackId,
              },
            });
          }}
        >
          <button
            className="w-6 h-6"
            onClick={() => {
              audioPlayer.play.trackList(props.list, connection.trackNumber);
            }}
          >
            <Play className="group-hover:block hidden m-0 p-0" />
            <span className="group-hover:hidden">{connection.trackNumber}</span>
          </button>
          <div>{connection.track.title}</div>
        </div>
      ))}
    </div>
  );
}
