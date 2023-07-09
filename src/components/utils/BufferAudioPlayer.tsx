import { useAsyncLoad } from "@/src/hooks/use-async-load";
import { Loader2, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type BufferAudioPlayer = {
  data: Uint8Array;
  options?: Partial<BufferAudioOptions>;
};

type BufferAudioOptions = {
  text: string;
};

export default function BufferAudioPlayer(props: BufferAudioPlayer) {
  const [playing, _setPlaying] = useState(false);
  const [fileBuffer, audioLoaded] = useAsyncLoad<AudioBuffer | undefined>(
    async () => {
      // copy the array buffer because decodeAudioData seems to modify it
      const dst = new ArrayBuffer(props.data.byteLength);
      new Uint8Array(dst).set(props.data);
      return await audioContext.current.decodeAudioData(dst);
    },
    undefined,
    [props.data]
  );
  const audioContext = useRef(new window.AudioContext());
  const bufferSource = useRef<AudioBufferSourceNode | undefined>(undefined);

  const optionsWithDefaults: BufferAudioOptions = {
    text: props.options?.text || "Play Audio",
  };

  useEffect(() => {
    return () => {
      if (bufferSource.current !== undefined) {
        bufferSource.current.stop();
        _setPlaying(false);
      }
    };
  }, []);

  const toggle = () => {
    if (!playing) {
      if (fileBuffer !== undefined && audioLoaded) {
        bufferSource.current = audioContext.current.createBufferSource();
        bufferSource.current.buffer = fileBuffer;
        bufferSource.current.connect(audioContext.current.destination);
        bufferSource.current.start();
      } else {
        console.log("File was not loaded");
        return;
      }
    } else {
      if (bufferSource.current !== undefined) {
        bufferSource.current.stop();
        bufferSource.current = undefined;
      }
    }

    _setPlaying(!playing);
  };

  return (
    <div className="flex">
      <div className="m-1">
        {audioLoaded ? (
          <button onClick={toggle}>{playing ? <Pause /> : <Play />}</button>
        ) : (
          <Loader2 className="inline animate-spin" />
        )}
      </div>
      <span className="m-1">{optionsWithDefaults.text}</span>
    </div>
  );
}
