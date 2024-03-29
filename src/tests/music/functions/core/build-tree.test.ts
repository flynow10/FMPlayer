import { buildTree } from "@/src/music/functions/core/build-tree";
import { flattenTree } from "@/src/music/functions/core/flatten-tree";
import { createTreePair } from "@/src/tests/music/functions/core/flat-upright-tree-pair";
import { createTestTree } from "@/src/tests/music/functions/utils/test-tree";

describe("Build Tree", () => {
  it("correctly rebuilds a flattened tree", () => {
    const { tree } = createTestTree();
    const flatTree = flattenTree(tree);
    expect(buildTree(flatTree)).toEqual(tree);
  });

  it("correctly builds a tree from a static test", () => {
    const { tree, flatTree } = createTreePair();
    expect(buildTree(flatTree)).toEqual(tree);
  });
});
