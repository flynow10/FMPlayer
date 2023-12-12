import { UniqueIdentifier } from "@dnd-kit/core";
import React from "react";

export namespace Functions {
  export type FunctionContext = {
    activeGroup: ActionGroup | null;
    activeId: UniqueIdentifier | null;
    overId: UniqueIdentifier | null;
    offsetLeft: number;
  };

  export type ActionGroup = "actions" | "tracks" | "numbers";

  export type ActionType =
    | "play"
    | "loop"
    | "trackliteral"
    | "numberliteral"
    | "binaryarith";

  export interface ActionState {
    id: string;
    type: ActionType;
    group: ActionGroup;
    childNodes: ActionState[];
    trackExpressions: NullableTree;
    numberExpressions: NullableTree;
    data?: unknown;
  }
  export interface TrackLiteral extends ActionState {
    data: {
      trackId: string;
    };
  }

  export interface NumberLiteral extends ActionState {
    data: {
      value: number;
    };
  }

  export type BinaryOp = "+" | "-" | "*" | "/";
  export interface BinaryArithmetic extends ActionState {
    data: {
      operator: BinaryOp;
    };
  }

  export type FunctionTree = ActionState[];

  export type NullableTree = (ActionState | null)[];

  export type FlattenedActionState = ActionState & {
    parentId: UniqueIdentifier | null;
    depth: number;
    index: number;
  };

  export type DraggingGroup = ActionGroup | "trash";

  export type IdData = {
    group: ActionGroup;
    type: ActionType;
    id: string;
  };

  type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

  export type SetFunctionTree = SetState<FunctionTree>;

  export type SetAction<A extends ActionState = ActionState | null> =
    SetState<A>;
}
