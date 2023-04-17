import { Music4, PlayCircle } from "lucide-react";

export default function AudioControlPlaceholder({
  onPlay,
}: {
  onPlay: () => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col mx-auto text-center">
        <Music4 />
      </div>
      <div className="controls flex justify-center">
        <div className="grid grid-cols-5 gap-24">
          <button className="audio-button col-start-3" onClick={onPlay}>
            <PlayCircle size={40} />
          </button>
        </div>
      </div>
      <div className="w-full h-3 bg-slate-200 relative rounded-md overflow-hidden"></div>
    </div>
  );
}
