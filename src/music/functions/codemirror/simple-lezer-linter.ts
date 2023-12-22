import { syntaxTree } from "@codemirror/language";
import { linter } from "@codemirror/lint";
import { NodeType } from "@lezer/common";
// From https://discuss.codemirror.net/t/show-syntax-error-from-lezer-parse/5346/2
export function simpleLezerLinter() {
  return linter((view) => {
    const { state } = view;
    const tree = syntaxTree(state);
    if (tree.length === state.doc.length) {
      let startPos: number | null = null;
      let endPos: number | null = null;
      let node: NodeType | null = null;
      tree.iterate({
        enter: (n) => {
          if (startPos === null && n.type.isError) {
            startPos = n.from;
            endPos = n.to;
            node = n.node.parent?.type ?? null;
            return false;
          }
        },
      });
      if (startPos !== null && endPos !== null)
        return [
          {
            from: startPos,
            to: endPos,
            severity: "error",
            message: `syntax error in ${
              node !== null ? (node as NodeType).name : "Unknown"
            }`,
          },
        ];
    }

    return [];
  });
}
