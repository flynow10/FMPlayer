import { AudioPlayer } from "@/src/music/player/audio-player";

const player = new AudioPlayer();
export function useAudioPlayer() {
  return player;
}
// export function useAudioPlayer(id: string | null, onSongEnded?: () => void) {
//   const audioTag = useRef(new Audio());
//   const mediaSourceNode = useRef<MediaElementAudioSourceNode>();
//   const [loaded, setLoaded] = useState(false);
//   const [percentLoaded, setPercentLoaded] = useState(0);
//   const [playing, setPlaying] = useState(false);
//   const [seeking, setSeeking] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const seekToTime = (time: number, end = false) => {
//     if (!audioTag.current.paused) {
//       audioTag.current.pause();
//     }
//     setSeeking(true);
//     audioTag.current.currentTime = time;
//     if (end && playing) {
//       setSeeking(false);
//       audioTag.current.play();
//     }
//   };
//   const resetPlayback = () => {
//     audioTag.current.currentTime = 0;
//   };
//   const startPlayback = () => {
//     if (mediaSourceNode.current === undefined) {
//       const ctx = new AudioContext();
//       mediaSourceNode.current = new MediaElementAudioSourceNode(ctx, {
//         mediaElement: audioTag.current,
//       });
//       mediaSourceNode.current.connect(ctx.destination);
//     }
//     setPlaying(true);
//     if (loaded) {
//       audioTag.current.play();
//     }
//   };
//   const pausePlayback = () => {
//     setPlaying(false);
//     audioTag.current.pause();
//   };
//   useEffect(() => {
//     audioTag.current.crossOrigin = "*";
//   }, [audioTag]);
//   useEffect(() => {
//     let active = true;
//     const audioRef = audioTag.current;
//     if (id !== null) {
//       (async () => {
//         const url = await MusicLibrary.audio.getAudioFileUrl(id);
//         if (url !== null && active) {
//           audioRef.src = url;
//           audioRef.load();
//         }
//       })();
//     }
//     return () => {
//       active = false;
//       setLoaded(false);
//       setPercentLoaded(0);
//       setCurrentTime(0);
//       setDuration(0);
//       audioRef.src = "";
//     };
//   }, [id]);
//   useEffect(() => {
//     const audioRef = audioTag.current;
//     if (onSongEnded) {
//       audioRef.addEventListener("ended", onSongEnded);
//     }
//     return () => {
//       if (onSongEnded) {
//         audioRef.removeEventListener("ended", onSongEnded);
//       }
//     };
//   }, [onSongEnded]);
//   useEffect(() => {
//     const audioRef = audioTag.current;
//     const canPlayThroughCallback = () => {
//       setLoaded(true);
//       if (playing && !seeking) {
//         audioRef.play();
//       }
//     };
//     const progressCallback = () => {
//       const buffered = audioRef.buffered;
//       if (buffered.length) {
//         setPercentLoaded((100 * buffered.end(0)) / audioRef.duration);
//       }
//     };
//     const timeUpdateCallback = () => {
//       setCurrentTime(audioRef.currentTime);
//       if (!isNaN(audioRef.duration)) {
//         setDuration(audioRef.duration);
//       }
//     };
//     audioRef.addEventListener("canplaythrough", canPlayThroughCallback);
//     audioRef.addEventListener("progress", progressCallback);
//     audioRef.addEventListener("timeupdate", timeUpdateCallback);
//     return () => {
//       audioRef.removeEventListener("canplaythrough", canPlayThroughCallback);
//       audioRef.removeEventListener("progress", progressCallback);
//       audioRef.removeEventListener("timeupdate", timeUpdateCallback);
//     };
//   }, [
//     setLoaded,
//     setPercentLoaded,
//     setCurrentTime,
//     setDuration,
//     playing,
//     seeking,
//   ]);
//   return {
//     loaded,
//     percentLoaded,
//     playing,
//     currentTime,
//     duration,
//     startPlayback,
//     pausePlayback,
//     resetPlayback,
//     seekToTime,
//   };
// }
