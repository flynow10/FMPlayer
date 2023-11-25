import { Functions } from "@/src/types/functions";
import { UniqueIdentifier } from "@dnd-kit/core";

type TreeNode = { id: UniqueIdentifier; children: TreeNode[] };
export function buildTree(
  flattenedActions: Functions.FlattenedActionState[]
): Functions.ActionState[] {
  const root = { id: "root", children: [] };
  const nodes: Record<string, TreeNode> = { [root.id]: root };
  const actions: Functions.FlattenedActionState[] = flattenedActions.map(
    (action) => ({ ...action, children: [] })
  );

  for (const action of actions) {
    const { id, children } = action;
    const parentId = (action.parentId as string) ?? root.id;
    const parent = nodes[parentId] ?? actions.find(({ id }) => id === parentId);

    nodes[id] = { id, children };
    const filteredAction = action as Functions.ActionState;
    parent.children.push(filteredAction as Functions.ActionState);
  }
  return root.children;
}
