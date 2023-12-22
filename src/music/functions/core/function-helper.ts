import { FunctionBuilder } from "@/src/music/functions/core/function-builder";
import { PlayableFunction } from "@/src/music/functions/core/playable-function";

export function playableFunctionFromTracks(
  ...trackIds: string[]
): PlayableFunction {
  const functionBuilder = new FunctionBuilder();
  for (const trackId of trackIds) {
    functionBuilder.addPlayAction(trackId);
  }
  return new PlayableFunction(functionBuilder.build());
}
