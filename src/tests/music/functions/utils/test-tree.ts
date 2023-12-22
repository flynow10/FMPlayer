import { createEmpty } from "@/src/music/functions/utils/create-empty";
import { Functions } from "@/src/types/functions";

export function createTestTree() {
  const loop = createEmpty.loop();
  const nestedLoop = createEmpty.loop();
  const nestedLoopNestedArith = createEmpty.loop();
  const freePlay = createEmpty.play();
  const loopedPlay = createEmpty.play();
  const leftOnlyBinaryArith = createEmpty.binaryarith();
  const rightOnlyBinaryArith = createEmpty.binaryarith();
  const leftLiteral = createEmpty.numberliteral();
  const rightLiteral = createEmpty.numberliteral();
  const trackLiteral = createEmpty.trackliteral();
  const parentBinaryArith = createEmpty.binaryarith();
  const childBinaryArith = createEmpty.binaryarith();
  const childLiteral = createEmpty.numberliteral();

  leftOnlyBinaryArith.numberExpressions[0] = leftLiteral;
  rightOnlyBinaryArith.numberExpressions[1] = rightLiteral;

  parentBinaryArith.numberExpressions[0] = childBinaryArith;
  childBinaryArith.numberExpressions[0] = childLiteral;

  loopedPlay.trackExpressions[0] = trackLiteral;
  loop.numberExpressions[0] = leftOnlyBinaryArith;
  nestedLoop.numberExpressions[0] = rightOnlyBinaryArith;
  nestedLoopNestedArith.numberExpressions[0] = parentBinaryArith;
  loop.childNodes.push(loopedPlay);
  loop.childNodes.push(nestedLoop);
  loop.childNodes.push(nestedLoopNestedArith);
  const tree: Functions.FunctionTree = [freePlay, loop];
  return {
    tree,
    loop,
    nestedLoop,
    nestedLoopNestedArith,
    freePlay,
    loopedPlay,
    leftOnlyBinaryArith,
    rightOnlyBinaryArith,
    leftLiteral,
    rightLiteral,
    trackLiteral,
    parentBinaryArith,
    childBinaryArith,
    childLiteral,
  };
}
