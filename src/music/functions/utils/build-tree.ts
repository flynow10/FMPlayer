import { Functions } from "@/src/types/functions";

type TreeNode = { id: string; childNodes: TreeNode[] };
export function buildTree(
  flattenedActions: Functions.FlattenedActionState[]
): Functions.ActionState[] {
  const root = { id: "root", childNodes: [] };
  const nodes: Record<string, TreeNode> = { [root.id]: root };
  const actions: Functions.FlattenedActionState[] = flattenedActions.map(
    (action) => ({ ...action, childNodes: [] })
  );

  for (const action of actions) {
    const { id, childNodes } = action;
    const parentId = (action.parentId as string) ?? root.id;
    const parent = nodes[parentId] ?? actions.find(({ id }) => id === parentId);

    nodes[id] = { id, childNodes };
    const filteredAction = action as Functions.ActionState;
    parent.childNodes.push(filteredAction as Functions.ActionState);
  }
  return root.childNodes as Functions.ActionState[];
}
