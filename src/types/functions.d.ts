import { UniqueIdentifier } from "@dnd-kit/core";
import React from "react";

export namespace Functions {
  export type FunctionContext = {
    activeGroup: DraggingGroup | null;
    activeId: UniqueIdentifier | null;
    overId: UniqueIdentifier | null;
    offsetLeft: number;
  };

  export type ActionType = "play" | "loop";
  export type TrackExpressionType = "literal";
  export type NumberExpressionType = "literal" | "binaryarith";

  export type BaseActionState = {
    id: string;
    children: ActionState[];
  };
  export type ActionState = PlayActionState | LoopActionState;

  export type PlayActionState = BaseActionState & {
    type: "play";
    trackExpression: TrackExpression | null;
  };

  export type LoopActionState = BaseActionState & {
    type: "loop";
    numberExpression: NumberExpression | null;
  };

  export type TrackExpression = TrackLiteral;
  export type TrackLiteral = {
    id: string;
    trackId: string;
    type: "literal";
  };

  export type NumberExpression = NumberLiteral | BinaryArithmetic;
  export type NumberLiteral = {
    id: string;
    value: number;
    type: "literal";
  };

  export type BinaryOp = "+" | "-" | "*" | "/";
  export type BinaryArithmetic = {
    id: string;
    op: BinaryOp;
    left: NumberExpression | null;
    right: NumberExpression | null;
    type: "binaryarith";
  };

  export type FunctionTree = ActionState[];

  export type FlattenedActionState = ActionState & {
    parentId: UniqueIdentifier | null;
    depth: number;
    index: number;
  };

  export type DraggingGroup = "actions" | "tracks" | "numbers" | "trash";

  export type IdData = {
    group: DraggingGroup;
    type: string;
    id: string;
    parentId?: string;
  };

  type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

  export type SetFunctionTree = SetState<FunctionTree>;

  export type SetAction<A extends ActionState> = SetState<A>;

  export type SetTrackExpression = SetState<TrackExpression | null>;

  export type SetNumberExpression = SetState<NumberExpression | null>;
}
