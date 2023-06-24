import {
  ChevronLeft,
  ChevronRight,
  Music4,
  PlayCircle,
  Repeat,
} from "lucide-react";

export default function AudioControlPlaceholder({
  onPlay,
}: {
  onPlay: () => void;
}) {
  return (
    <div className="flex flex-row">
      <div className="controls flex justify-center">
        <div className="grid grid-cols-5">
          <button className="audio-button" disabled>
            <Repeat size={40} />
          </button>
          <button className="audio-button" disabled>
            <ChevronLeft size={40} />
          </button>
          <button className="audio-button col-start-3" onClick={onPlay}>
            <PlayCircle size={40} />
          </button>
          <button className="audio-button" disabled>
            <ChevronRight size={40} />
          </button>
        </div>
      </div>
      <div className="flex flex-col grow text-center">
        <Music4 className="mx-auto my-2" size={32} />
        <div className="w-full h-3 bg-slate-200 rounded-md overflow-hidden"></div>
      </div>
    </div>
  );
}
