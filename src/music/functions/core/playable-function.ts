import { findActionDeep } from "@/src/music/functions/utils/find-action-deep";
import { findParentActionDeep } from "@/src/music/functions/utils/find-parent-action-deep";
import { validateFunction } from "@/src/music/functions/validation/validate-function";
import { Functions } from "@/src/types/functions";

export class PlayableFunction {
  /*
    Because playable functions are to be used in react
    state hooks and react state hooks are immutable,
    the Playable Function class is also immutable.

    Any methods that update the function tree will return
    a new Playable Function object.
   */

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

  public addStatements(statements: Functions.FunctionTree): PlayableFunction {
    // Simple deep copy of the function tree
    // Only works because there aren't any non-stringifiable types in a function tree
    // Looking into using the structuredClone method
    const clonedTree: Functions.FunctionTree = JSON.parse(
      JSON.stringify(this.functionTree)
    );
    clonedTree.push(...statements);

    return new PlayableFunction(clonedTree);
  }

  public insertAfter(
    previousActionId: string,
    statements: Functions.FunctionTree
  ): PlayableFunction {
    const clonedTree: Functions.FunctionTree = JSON.parse(
      JSON.stringify(this.functionTree)
    );
    const rootIndex = clonedTree.findIndex(({ id }) => id === previousActionId);
    const parentNode = findParentActionDeep(clonedTree, previousActionId);

    // This makes sure that the new statements are added to the same
    // block (loop, condition, etc...) as the previous action

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

    parentList.splice(previousActionIndex + 1, 0, ...statements);

    return new PlayableFunction(clonedTree);
  }

  // Returns the next state that includes a track id and whether
  // the program had looped back to the top.
  public getNextTrack(
    currentState?: Functions.RuntimeState
  ): [Functions.RuntimeState, boolean] {
    if (!currentState) {
      currentState = this.createInitialState();
    }
    let trackId: string | null = null;
    let nextState = currentState;
    // If the currentState was the last state, capture it when returning the next state
    let didEnd = currentState.isEnd;
    while (trackId === null) {
      nextState = this.evaluateState(nextState);
      trackId = nextState.currentTrackId;
      // trackId === null because we want to catch the end when switching to the next track
      if (nextState.isEnd && trackId === null) {
        didEnd = true;
      }
    }
    return [nextState, didEnd];
  }

  // This runs through the program until it reaches the
  // last state with a track id.
  // It also returns a list of all the states containing
  // track ids for the previous button.
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

  private stateError() {
    return new Error(
      "There is something wrong with the current state! Unable to find next song"
    );
  }
  private unexpectedActionError() {
    return new Error("Unexpected action type!");
  }

  // A wrapper around the findParentActionDeep method to
  // differentiate between actually missing a parent and
  // simply being in the root array without a parent.
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

  // Entry to the AST walker
  // Contains the logic to return the next state
  // based on the current state.
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

    // Handle each type of statement (block level action)
    switch (currentAction.type) {
      case "play": {
        nextState.currentTrackId = this.evaluatePlayAction(
          currentAction,
          currentState
        );
        break;
      }
      case "loop": {
        const loopResult = this.evaluateLoopAction(currentAction, currentState);
        if (loopResult === "next") {
          delete nextState.loopIndices[currentAction.id];
        } else {
          nextState.loopIndices[currentAction.id] = loopResult;
          // Override next action search by starting the loop block.
          nextActionId = currentAction.childNodes[0].id;
        }
        break;
      }
      default: {
        throw this.stateError();
      }
    }

    // Determine the action to evaluate in the next state.
    let currentChildAction = currentAction;
    let parentNode = this.getParentNode(currentChildAction.id);
    while (nextActionId === null) {
      const parentList = parentNode?.childNodes ?? this.functionTree;

      const parentActionIndex = parentList.indexOf(currentAction);

      // If the current action is not the last in it's block,
      // set the next action to be one index higher.
      if (parentActionIndex !== parentList.length - 1) {
        nextActionId = parentList[parentActionIndex + 1].id;
        break;
      }

      // If the parent node is falsy, then the current
      // action is at the end of the root list, so we
      // need to start over from the top.
      if (!parentNode) {
        nextActionId = this.functionTree[0].id;
        nextState.isEnd = true;
        break;
      }

      // If the current action is at the end of a loop,
      // then the next action will be the loop to check
      // if the loop is finished.
      if (parentNode.type === "loop") {
        nextActionId = parentNode.id;
        break;
      }

      // If we are at the end of a block and none of the previous
      // rules have matched, then we should check next block up.
      currentChildAction = parentNode;
      parentNode = this.getParentNode(parentNode.id);
    }

    nextState.nextActionId = nextActionId;

    return nextState;
  }

  // Walks the AST node for a loop action.
  // Determine what the next loop index should be or if it should break out.
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

  // Walks the AST node for a number expression
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

  // Walks the AST node for a binary arithmetic expression
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

  // Walks the AST node for a number literal
  private evaluateNumberLiteral(expression: Functions.ActionState): number {
    return (expression as Functions.NumberLiteral).data.value;
  }

  // Walks the AST node for a play action
  private evaluatePlayAction(
    action: Functions.ActionState,
    state: Functions.RuntimeState
  ): string {
    return this.evaluateTrackExpression(
      action.trackExpressions[0] as Functions.ActionState,
      state
    );
  }

  // Walks the AST node for a track expression
  // Set up to include multiple types of track expressions in the future
  private evaluateTrackExpression(
    expression: Functions.ActionState,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    state: Functions.RuntimeState
  ): string {
    if (expression.type === "trackliteral") {
      return this.evaluateTrackLiteral(expression);
    }
    throw this.unexpectedActionError();
  }

  // Walks the AST node for a track literal
  private evaluateTrackLiteral(expression: Functions.ActionState): string {
    return (expression as Functions.TrackLiteral).data.trackId;
  }
}
