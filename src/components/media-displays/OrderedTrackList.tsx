import { Music } from "@/src/types/music";
import { Pages } from "@/src/types/pages";
import { Play } from "lucide-react";

type OrderedTrackListProps = {
  onPlayMedia: Pages.PlayByID;
  trackConnections: Music.DB.TableType<"TrackList">["trackConnections"];
};

export default function OrderedTrackList(props: OrderedTrackListProps) {
  return (
    <div className="flex flex-col w-full">
      {props.trackConnections.map((connection, index) => (
        <div
          key={index}
          className="flex border-t-2 last:border-b-2 p-2 gap-4 group"
        >
          <button
            className="w-6 h-6"
            onClick={() => {
              props.onPlayMedia(connection.trackId, "track");
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
