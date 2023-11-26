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
  };

  export type TrackExpression = TrackLiteral;
  export type TrackLiteral = {
    id: UniqueIdentifier;
    trackId: string;
  };

  export type FunctionTree = ActionState[];

  export type FlattenedActionState = ActionState & {
    parentId: UniqueIdentifier | null;
    depth: number;
    index: number;
  };

  export type DraggingGroup = "actions" | "tracks" | "trash";

  export type SetFunctionTree = React.Dispatch<
    React.SetStateAction<FunctionTree>
  >;

  export type SetAction<A extends ActionState> = React.Dispatch<
    React.SetStateAction<A>
  >;

  export type SetTrackExpression = React.Dispatch<
    React.SetStateAction<TrackExpression | null>
  >;
}
