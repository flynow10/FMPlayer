import { FunctionBuilder } from "@/src/music/functions/core/function-builder";
import { PlayableFunction } from "@/src/music/functions/core/playable-function";
import { createEmpty } from "@/src/music/functions/utils/create-empty";
import { Functions } from "@/src/types/functions";
import { v4 as uuid } from "uuid";

describe("Playable Function", () => {
  const functionBuilder = new FunctionBuilder();
  const tracksIds = [uuid(), uuid(), uuid(), uuid(), uuid()];

  it("correctly identifies blank trees", () => {
    const nonBlank = new PlayableFunction(
      functionBuilder.addPlayAction(uuid()).build()
    );
    const blank = new PlayableFunction([]);
    expect(nonBlank.isBlank()).toBeFalse();
    expect(blank.isBlank()).toBeTrue();
  });

  it("correctly executes play actions", () => {
    const tree = functionBuilder
      .addPlayAction(tracksIds[0])
      .addPlayAction(tracksIds[1])
      .build();
    const play = new PlayableFunction(tree);
    let currentState: Functions.RuntimeState = play.getNextTrack()[0];
    expect(currentState.currentTrackId).toBe(tracksIds[0]);
    currentState = play.getNextTrack(currentState)[0];
    expect(currentState.currentTrackId).toBe(tracksIds[1]);
    currentState = play.getNextTrack(currentState)[0];
    expect(currentState.currentTrackId).toBe(tracksIds[0]);
  });

  it("correctly executes various loop lengths", () => {
    for (let loopCount = 1; loopCount <= 5; loopCount++) {
      const tree = functionBuilder
        .addLoop(FunctionBuilder.createNumberExpression(loopCount.toString()))
        .addPlayAction(tracksIds[0])
        .addPlayAction(tracksIds[1])
        .addPlayAction(tracksIds[2])
        .exitLoop()
        .addPlayAction("exited loop")
        .build();
      const play = new PlayableFunction(tree);
      const trackIdSubset = tracksIds.slice(0, 3);

      let currentState: Functions.RuntimeState | undefined = undefined;
      for (let loopIndex = 0; loopIndex < loopCount; loopIndex++) {
        for (
          let trackIndex = 0;
          trackIndex < trackIdSubset.length;
          trackIndex++
        ) {
          const actualTrackId = trackIdSubset[trackIndex];
          currentState = play.getNextTrack(currentState)[0];
          expect(currentState.currentTrackId).toBe(actualTrackId);
        }
      }
      expect(play.getNextTrack(currentState)[0].currentTrackId).toBe(
        "exited loop"
      );
    }
  });

  it("correctly evaluates binary expressions when calculuating loop counts", () => {
    const loopCount = 23; // make sure to update the binary expression below as well
    const tree = functionBuilder
      .addPlayAction("top")
      .addLoop(
        FunctionBuilder.createNumberExpression("(2 + 3) * 2 + 4 * 2 + 5") // 23
      )
      .addPlayAction(tracksIds[0])
      .exitLoop()
      .build();
    const play = new PlayableFunction(tree);

    let currentState: Functions.RuntimeState = play.getNextTrack()[0];
    for (let i = 0; i < loopCount; i++) {
      currentState = play.getNextTrack(currentState)[0];
      expect(currentState.currentTrackId).toBe(tracksIds[0]);
    }
    expect(play.getNextTrack(currentState)[0].currentTrackId).toBe("top");
  });

  it("correctly identifies when restarting in multiple situations", () => {
    function testFinalTrack(
      tree: Functions.FunctionTree,
      statesTillFinalTrack: number
    ) {
      const play = new PlayableFunction(tree);

      let currentState: Functions.RuntimeState | undefined = undefined;
      for (let i = 0; i < statesTillFinalTrack; i++) {
        currentState = play.getNextTrack(currentState)[0];
      }
      expect(play.getNextTrack(currentState)[1]).toBeTrue();
    }
    functionBuilder
      .addPlayAction("top")
      .addLoop(FunctionBuilder.createNumberExpression("3"))
      .addPlayAction(tracksIds[0])
      .addLoop(FunctionBuilder.createNumberExpression("1+1"))
      .addPlayAction(tracksIds[1])
      .exitLoop();

    testFinalTrack(functionBuilder.getTree(), 10);
    functionBuilder.addPlayAction(tracksIds[2]).exitLoop();
    testFinalTrack(functionBuilder.getTree(), 13);
    functionBuilder.addPlayAction(tracksIds[3]);
    testFinalTrack(functionBuilder.build(), 14);
  });

  it("correctly returns the final track state", () => {
    const tree = functionBuilder
      .addPlayAction("top")
      .addLoop(FunctionBuilder.createNumberExpression("2"))
      .addLoop(FunctionBuilder.createNumberExpression("4"))
      .addPlayAction(tracksIds[0])
      .build();
    const play = new PlayableFunction(tree);

    const { lastState, trackStates: previousTrackStates } = play.getLastTrack();

    expect(lastState.currentTrackId).toBe(tracksIds[0]);
    expect(previousTrackStates.length).toBe(8);
  });

  it("fails on loops with invalid counts", () => {
    let tree = functionBuilder
      .addLoop({ ...createEmpty.numberliteral(), data: { value: -1 } })
      .addPlayAction(tracksIds[0])
      .exitLoop()
      .build();
    let play = new PlayableFunction(tree);
    expect(() => play.getNextTrack()).toThrow();
    tree = functionBuilder
      .addLoop(FunctionBuilder.createNumberExpression("3-3"))
      .addPlayAction(tracksIds[0])
      .exitLoop()
      .build();
    play = new PlayableFunction(tree);
    expect(() => play.getNextTrack()).toThrow();
  });
});
