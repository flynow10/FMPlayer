import { UniqueIdentifier } from "@dnd-kit/core";
import React from "react";

export namespace Functions {
  export type FunctionContext = {
    activeId: UniqueIdentifier | null;
    overId: UniqueIdentifier | null;
    offsetLeft: number;
  };

  export type ActionType = "play" | "loop";

  export type ActionState = {
    id: string;
    type: ActionType;
    children: ActionState[];
  };

  export type FunctionTree = ActionState[];

  export type SetFunctionTree = React.Dispatch<
    React.SetStateAction<FunctionTree>
  >;

  export type FlattenedActionState = ActionState & {
    parentId: UniqueIdentifier | null;
    depth: number;
    index: number;
  };
}
