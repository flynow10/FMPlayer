import { findActionDeep } from "@/src/music/functions/utils/find-action-deep";
import { findParentActionDeep } from "@/src/music/functions/utils/find-parent-action-deep";
import { flattenTree } from "@/src/music/functions/utils/flatten-tree";
import { validateFunction } from "@/src/music/functions/validation/validate-function";
import { Functions } from "@/src/types/functions";

export class PlayableFunction {
  public readonly functionTree: Functions.FunctionTree;
  private readonly flatTree: Functions.FlattenedActionState[];

  constructor(functionTree: Functions.FunctionTree) {
    if (!validateFunction(functionTree)) {
      throw new Error("Function tree is corrupt! Unable to play function");
    }
    this.functionTree = functionTree;
    this.flatTree = flattenTree(functionTree);
  }

  private stateError() {
    return new Error(
      "There is something wrong with the current state! Unable to find next song"
    );
  }
  private unexpectedActionError() {
    return new Error("Unexpected action type!");
  }

  getNextTrack(
    currentState?: Functions.RuntimeState
  ): [string | null, Functions.RuntimeState, Functions.RuntimeState] {
    if (!currentState) {
      currentState = {
        currentActionId: this.functionTree[0].id,
        fromStart: true,
        loopIndices: {},
      };
    }
    let trackId: string | null = null;
    let nextState = currentState;
    while (trackId === null) {
      currentState = nextState;
      [trackId, nextState] = this.evaluateState(currentState);
    }
    return [trackId, nextState, currentState];
  }

  private getParentStatementList(actionId: string) {
    let currentAction = this.flatTree.find(({ id }) => id === actionId);
    const parentArray: string[] = [actionId];
    while (currentAction) {
      if (typeof currentAction.parentId === "string") {
        actionId = currentAction.parentId;
        parentArray.unshift(actionId);
        currentAction = this.flatTree.find(({ id }) => id === actionId);
      } else {
        currentAction = undefined;
      }
    }
    return parentArray;
  }

  private evaluateState(
    currentState: Functions.RuntimeState
  ): [string | null, Functions.RuntimeState] {
    const nextState: Functions.RuntimeState = JSON.parse(
      JSON.stringify(currentState)
    );
    nextState.fromStart = false;
    const currentAction = findActionDeep(
      this.functionTree,
      currentState.currentActionId
    );
    if (!currentAction || currentAction.group !== "actions") {
      throw this.stateError();
    }
    const isCurrentActionInRoot = this.functionTree.includes(currentAction);
    let parentBlock: Functions.ActionState[];
    if (isCurrentActionInRoot) {
      parentBlock = this.functionTree;
    } else {
      const parentNode =
        findParentActionDeep(this.functionTree, currentState.currentActionId) ??
        null;
      if (!parentNode) {
        throw this.stateError();
      }
      parentBlock = parentNode.childNodes;
    }

    const nextIndex =
      parentBlock.findIndex(({ id }) => id === currentState.currentActionId) +
      1;
    let nextAction: Functions.ActionState | null = null;
    if (nextIndex === parentBlock.length) {
      if (!isCurrentActionInRoot) {
        const parentArray = this.getParentStatementList(currentAction.id);
        let currentLoopAction = currentAction;
        for (let i = parentArray.length - 1; i >= 0; i--) {
          const parentAction = findActionDeep(
            this.functionTree,
            parentArray[i]
          );
          if (!parentAction) {
            throw this.stateError();
          }
          const parentIndex =
            parentAction.childNodes.indexOf(currentLoopAction);
          if (parentAction.type === "loop") {
            nextAction = parentAction;
            break;
          } else if (parentIndex !== parentAction.childNodes.length - 1) {
            nextAction = parentAction.childNodes[parentIndex + 1];
            break;
          }
          if (i === 0) {
            const rootIndex = this.functionTree.indexOf(parentAction);
            if (rootIndex + 1 === this.functionTree.length) {
              nextAction = this.functionTree[rootIndex + 1];
            }
          }
          currentLoopAction = parentAction;
        }
        if (nextAction === null) {
          nextAction = this.functionTree[0];
          nextState.fromStart = true;
        }
      } else {
        nextAction = this.functionTree[0];
        nextState.fromStart = true;
      }
    } else {
      nextAction = parentBlock[nextIndex];
    }
    nextState.currentActionId = nextAction.id;

    let trackId: string | null = null;
    if (currentAction.type === "play") {
      trackId = this.evaluatePlayAction(currentAction, currentState);
    }

    if (currentAction.type === "loop") {
      const loopResult = this.evaluateLoopAction(currentAction, currentState);
      if (loopResult === "next") {
        delete nextState.loopIndices[currentAction.id];
        if (
          this.functionTree.indexOf(currentAction) ===
          this.functionTree.length - 1
        ) {
          nextState.fromStart = true;
        }
      } else {
        nextState.loopIndices[currentAction.id] = loopResult;
        nextState.currentActionId = currentAction.childNodes[0].id;
        nextState.fromStart = false;
      }
    }

    return [trackId, nextState];
  }

  private evaluateLoopAction(
    action: Functions.ActionState,
    state: Functions.RuntimeState
  ): number | "next" {
    const currentLoopIndex = state.loopIndices[action.id] ?? 0;
    const totalLoopCount = this.evaluateNumberExpression(
      action.numberExpressions[0] as Functions.ActionState,
      state
    );
    if (totalLoopCount < 1) {
      throw new Error("Runtime Error: Loop count can't be less than 1");
    }
    if (currentLoopIndex < totalLoopCount) {
      return currentLoopIndex + 1;
    }
    return "next";
  }

  private evaluateNumberExpression(
    expression: Functions.ActionState,
    state: Functions.RuntimeState
  ): number {
    switch (expression.type) {
      case "binaryarith": {
        return this.evaluateBinaryArith(expression, state);
      }
      case "numberliteral": {
        return this.evaluateNumberLiteral(expression);
      }
      default: {
        throw this.unexpectedActionError();
      }
    }
  }

  private evaluateBinaryArith(
    expression: Functions.ActionState,
    state: Functions.RuntimeState
  ): number {
    const left = this.evaluateNumberExpression(
      expression.numberExpressions[0] as Functions.ActionState,
      state
    );
    const right = this.evaluateNumberExpression(
      expression.numberExpressions[1] as Functions.ActionState,
      state
    );
    const operator = (expression as Functions.BinaryArithmetic).data.operator;
    switch (operator) {
      case "+": {
        return left + right;
      }
      case "-": {
        return left - right;
      }
      case "*": {
        return left * right;
      }
      case "/": {
        return Math.round(left / right);
      }
    }
  }

  private evaluateNumberLiteral(expression: Functions.ActionState): number {
    return (expression as Functions.NumberLiteral).data.value;
  }

  private evaluatePlayAction(
    action: Functions.ActionState,
    state: Functions.RuntimeState
  ): string {
    return this.evaluateTrackExpression(
      action.trackExpressions[0] as Functions.ActionState,
      state
    );
  }

  private evaluateTrackExpression(
    expression: Functions.ActionState,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    state: Functions.RuntimeState
  ): string {
    if (expression.type === "trackliteral") {
      return (expression as Functions.TrackLiteral).data.trackId;
    }
    throw this.unexpectedActionError();
  }
}
