import { AudioPlayer } from "@/src/music/player/audio-player";

const player = new AudioPlayer();
export function useAudioPlayer() {
  return player;
}
