import { useContext, useMemo } from "react";

import ActionList from "@/src/components/functions/ActionList";
import SortableAction from "@/src/components/functions/SortableAction";

import { FunctionEditor } from "@/src/contexts/FunctionEditor";
import { useFlattenedTree } from "@/src/hooks/functions/use-flattened-tree";
import { buildTree } from "@/src/music/functions/core/build-tree";
import { IndentationWidth } from "@/src/music/functions/core/constants";
import { flattenTree } from "@/src/music/functions/core/flatten-tree";
import { getDropProjection } from "@/src/music/functions/utils/get-drop-projection";
import { Functions } from "@/src/types/functions";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

type SortableFunctionDisplayProps = {
  functionTree: Functions.FunctionTree;
  setFunctionTree: Functions.SetFunctionTree;
};

/*
 * The idea of using a flattened tree of actions to
 *  emulate a nested tree structure is not mine.
 * The main idea and some helper code was sourced from
 *  the dnd-kit examples page.
 * https://master--5fc05e08a4a65d0021ae0bf2.chromatic.com/?path=/story/examples-tree-sortable--all-features
 * https://github.com/clauderic/dnd-kit/tree/master/stories/3%20-%20Examples/Tree
 * 
 * The rest of code and ideas are, to the best of my knowledge, my own.
MIT License

Copyright (c) 2021, Claudéric Demers

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

export default function SortableFunctionDisplay({
  functionTree,
  setFunctionTree,
}: SortableFunctionDisplayProps) {
  const functionCtx = useContext(FunctionEditor);
  if (functionCtx === null) {
    throw new Error("Sortable list was used outside of a function context!");
  }
  const { activeId, overId, offsetLeft, activeGroup } = functionCtx;

  const flattenedActions = useFlattenedTree(functionTree, activeId);
  const sortedIds = useMemo(
    () => flattenedActions.map(({ id }) => id),
    [flattenedActions]
  );

  const projectedDrop =
    activeId && overId && activeGroup === "actions"
      ? getDropProjection(
          flattenedActions,
          activeId,
          overId,
          offsetLeft,
          IndentationWidth
        )
      : null;
  return (
    <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
      <ActionList>
        {flattenedActions.map((action) => (
          <SortableAction
            key={action.id}
            id={action.id}
            setAction={(value) => {
              setFunctionTree((prevTree) => {
                const clonedTree = JSON.parse(
                  JSON.stringify(flattenTree(prevTree))
                ) as Functions.FlattenedActionState[];
                let newAction: Functions.ActionState;
                const oldActionIndex = clonedTree.findIndex(
                  ({ id }) => id === action.id
                );
                const oldAction = clonedTree.find(({ id }) => id === action.id);
                if (!oldAction) {
                  throw new Error("Trying to set action that does not exist!");
                }
                if (typeof value === "function") {
                  newAction = value(oldAction);
                } else {
                  newAction = value;
                }
                clonedTree[oldActionIndex] = { ...oldAction, ...newAction };
                const newTree = buildTree(clonedTree);
                return newTree;
              });
            }}
            action={action}
            clone={false}
            depth={
              action.id === activeId && projectedDrop
                ? projectedDrop.depth
                : action.depth
            }
          />
        ))}
      </ActionList>
    </SortableContext>
  );
}
