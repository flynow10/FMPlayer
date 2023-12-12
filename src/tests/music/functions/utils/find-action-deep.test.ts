import { findActionDeep } from "@/src/music/functions/utils/find-action-deep";
import { createTestTree } from "@/src/tests/music/functions/utils/test-tree";

describe("Find Action Deep", () => {
  const {
    tree,
    loop,
    loopedPlay,
    leftOnlyBinaryArith,
    leftLiteral,
    rightLiteral,
    trackLiteral,
  } = createTestTree();

  it("finds top level statements", () => {
    expect(findActionDeep(tree, loop.id)).toBe(loop);
  });

  it("finds nested statements", () => {
    expect(findActionDeep(tree, loopedPlay.id)).toBe(loopedPlay);
  });

  it("finds binary arith expressions", () => {
    expect(findActionDeep(tree, leftOnlyBinaryArith.id)).toBe(
      leftOnlyBinaryArith
    );
  });

  it("finds left side number literals in binary arith", () => {
    expect(findActionDeep(tree, leftLiteral.id)).toBe(leftLiteral);
  });

  it("finds right side number literals in binary arith", () => {
    expect(findActionDeep(tree, rightLiteral.id)).toBe(rightLiteral);
  });

  it("finds track literals in nested statements", () => {
    expect(findActionDeep(tree, trackLiteral.id)).toBe(trackLiteral);
  });
});
