import { createEmpty } from "@/src/music/functions/utils/create-empty";
import { findActionDeep } from "@/src/music/functions/utils/find-action-deep";
import { findParentActionDeep } from "@/src/music/functions/utils/find-parent-action-deep";
import { validateFunction } from "@/src/music/functions/validation/validate-function";
import { Functions } from "@/src/types/functions";

export class PlayableFunction {
  public readonly functionTree: Functions.FunctionTree;

  constructor(functionTree: Functions.FunctionTree) {
    if (!validateFunction(functionTree)) {
      throw new Error("Function tree is corrupt! Unable to play function");
    }
    this.functionTree = functionTree;
  }

  public isBlank() {
    return this.functionTree.length === 0;
  }

  public createInitialState(): Functions.RuntimeState {
    return {
      currentActionId: "",
      currentTrackId: "",
      isEnd: false,
      nextActionId: this.functionTree[0].id,
      loopIndices: {},
    };
  }

  public addTrack(...trackId: string[]): PlayableFunction {
    const clonedTree: Functions.FunctionTree = JSON.parse(
      JSON.stringify(this.functionTree)
    );
    clonedTree.push(
      ...trackId.map((id) => PlayableFunction.createNewTrackAction(id))
    );

    return new PlayableFunction(clonedTree);
  }

  public insertTrackAfter(
    previousActionId: string,
    ...trackId: string[]
  ): PlayableFunction {
    const clonedTree: Functions.FunctionTree = JSON.parse(
      JSON.stringify(this.functionTree)
    );
    const rootIndex = clonedTree.findIndex(({ id }) => id === previousActionId);
    const parentNode = findParentActionDeep(clonedTree, previousActionId);

    let parentList: Functions.FunctionTree;
    let previousActionIndex: number;
    if (parentNode) {
      parentList = parentNode.childNodes;
      previousActionIndex = parentList.findIndex(
        ({ id }) => id === previousActionId
      );
    } else if (rootIndex !== -1) {
      parentList = clonedTree;
      previousActionIndex = rootIndex;
    } else {
      throw new Error("Previous action couldn't be found in function tree!");
    }

    parentList.splice(
      previousActionIndex,
      0,
      ...trackId.map((id) => PlayableFunction.createNewTrackAction(id))
    );

    return new PlayableFunction(clonedTree);
  }

  public getNextTrack(
    currentState?: Functions.RuntimeState
  ): [Functions.RuntimeState, boolean] {
    if (!currentState) {
      currentState = this.createInitialState();
    }
    let trackId: string | null = null;
    let nextState = currentState;
    let didEnd = nextState.isEnd;
    while (trackId === null) {
      nextState = this.evaluateState(nextState);
      trackId = nextState.currentTrackId;
      if (nextState.isEnd) {
        didEnd = true;
      }
    }
    return [nextState, didEnd];
  }

  public getLastTrack(): {
    lastState: Functions.RuntimeState;
    trackStates: Functions.RuntimeState[];
  } {
    let lastTrackState: Functions.RuntimeState | null = null;
    let currentState = this.createInitialState();
    const trackStates: Functions.RuntimeState[] = [];
    while (!currentState.isEnd) {
      currentState = this.evaluateState(currentState);
      if (currentState.currentTrackId !== null) {
        if (lastTrackState !== null) {
          trackStates.push(lastTrackState);
        }
        lastTrackState = currentState;
      }
    }
    if (!lastTrackState) {
      throw this.stateError();
    }
    return {
      lastState: lastTrackState,
      trackStates: trackStates,
    };
  }

  public getLastState(): Functions.RuntimeState {
    let currentState = this.createInitialState();
    while (!currentState.isEnd) {
      currentState = this.evaluateState(currentState);
    }
    return currentState;
  }

  public static createNewTrackAction(trackId: string): Functions.ActionState {
    return {
      ...createEmpty.play(),
      trackExpressions: [
        {
          ...createEmpty.trackliteral(),
          data: {
            trackId,
          },
        } as Functions.TrackLiteral,
      ],
    };
  }

  private stateError() {
    return new Error(
      "There is something wrong with the current state! Unable to find next song"
    );
  }
  private unexpectedActionError() {
    return new Error("Unexpected action type!");
  }

  private getParentNode(actionId: string): Functions.ActionState | undefined {
    const isCurrentActionInRoot =
      this.functionTree.findIndex(({ id }) => id === actionId) !== -1;
    if (isCurrentActionInRoot) {
      return undefined;
    } else {
      const parentNode =
        findParentActionDeep(this.functionTree, actionId) ?? null;
      if (!parentNode) {
        throw this.stateError();
      }
      return parentNode;
    }
  }

  private evaluateState(
    currentState: Functions.RuntimeState
  ): Functions.RuntimeState {
    const nextState: Functions.RuntimeState = {
      currentActionId: currentState.nextActionId,
      loopIndices: JSON.parse(JSON.stringify(currentState.loopIndices)),
      isEnd: false,
      nextActionId: "",
      currentTrackId: null,
    };

    let nextActionId: string | null = null;

    const currentAction = findActionDeep(
      this.functionTree,
      currentState.nextActionId
    );
    if (!currentAction) {
      throw this.stateError();
    }

    if (currentAction.type === "play") {
      nextState.currentTrackId = this.evaluatePlayAction(
        currentAction,
        currentState
      );
    }

    if (currentAction.type === "loop") {
      const loopResult = this.evaluateLoopAction(currentAction, currentState);
      if (loopResult === "next") {
        delete nextState.loopIndices[currentAction.id];
      } else {
        nextState.loopIndices[currentAction.id] = loopResult;
        nextActionId = currentAction.childNodes[0].id;
      }
    }

    let parentNode = this.getParentNode(currentAction.id);
    while (nextActionId === null) {
      const parentList = parentNode?.childNodes ?? this.functionTree;

      const parentActionIndex = parentList.indexOf(currentAction);
      if (parentActionIndex !== parentList.length - 1) {
        nextActionId = parentList[parentActionIndex + 1].id;
        break;
      }

      if (!parentNode) {
        nextActionId = this.functionTree[0].id;
        nextState.isEnd = true;
        break;
      }

      if (parentNode.type === "loop") {
        nextActionId = parentNode.id;
        break;
      }

      parentNode = this.getParentNode(currentAction.id);
    }

    nextState.nextActionId = nextActionId;

    return nextState;
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
