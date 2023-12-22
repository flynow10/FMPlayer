import { findParentActionDeep } from "@/src/music/functions/utils/find-parent-action-deep";
import { createTestTree } from "@/src/tests/music/functions/utils/test-tree";

describe("Find Parent Action Deep", () => {
  const {
    tree,
    loopedPlay,
    loop,
    leftOnlyBinaryArith,
    trackLiteral,
    leftLiteral,
    rightLiteral,
    rightOnlyBinaryArith,
    childLiteral,
    childBinaryArith,
  } = createTestTree();

  it("finds the parent of a statement", () => {
    expect(findParentActionDeep(tree, loopedPlay.id)).toBe(loop);
  });

  it("finds the parent statement of a number expression", () => {
    expect(findParentActionDeep(tree, leftOnlyBinaryArith.id)).toBe(loop);
  });

  it("finds the parent of a track literal", () => {
    expect(findParentActionDeep(tree, trackLiteral.id)).toBe(loopedPlay);
  });

  it("finds the parent of the left side of a binary arith", () => {
    expect(findParentActionDeep(tree, leftLiteral.id)).toBe(
      leftOnlyBinaryArith
    );
  });

  it("finds the parent of a right side only binary arith", () => {
    expect(findParentActionDeep(tree, rightLiteral.id)).toBe(
      rightOnlyBinaryArith
    );
  });

  it("finds the parent of a deeply nested number literal", () => {
    expect(findParentActionDeep(tree, childLiteral.id)).toBe(childBinaryArith);
  });
});
