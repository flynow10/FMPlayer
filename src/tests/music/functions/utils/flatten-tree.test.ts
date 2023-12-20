import { flattenTree } from "@/src/music/functions/core/flatten-tree";
import { createTreePair } from "@/src/tests/music/functions/utils/flat-upright-tree-pair";

describe("Flatten Tree", () => {
  const { tree, flatTree } = createTreePair();
  it("builds a flat with one nested track", () => {
    expect(flattenTree(tree)).toEqual(flatTree);
  });
});
