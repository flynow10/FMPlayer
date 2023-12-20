import { createEmpty } from "@/src/music/functions/utils/create-empty";
import { validateFunction } from "@/src/music/functions/validation/validate-function";
import { Functions } from "@/src/types/functions";

export class FunctionBuilder {
  private finished = false;
  private functionTree: Functions.FunctionTree = [];
  private blockPath: string[] = [];

  private clearIfFinished() {
    if (this.finished) {
      this.finished = false;
      this.functionTree = [];
      this.blockPath = [];
    }
  }

  public _addAction(action: Functions.ActionState): FunctionBuilder {
    this.clearIfFinished();
    let parentList = this.functionTree;
    for (let i = 0; i < this.blockPath.length; i++) {
      const parentId = this.blockPath[i];
      const newParent = parentList.find(({ id }) => id === parentId);
      if (!newParent) {
        throw new Error("Action couldn't be added! Block path does not exist!");
      }
      parentList = newParent.childNodes;
    }
    parentList.push(action);
    return this;
  }

  public addPlayAction(trackId: string): FunctionBuilder {
    this.clearIfFinished();
    this._addAction({
      ...createEmpty.play(),
      trackExpressions: [{ ...createEmpty.trackliteral(), data: { trackId } }],
    });
    return this;
  }

  public addLoop(count: Functions.ActionState): FunctionBuilder {
    this.clearIfFinished();
    const loopAction: Functions.ActionState = {
      ...createEmpty.loop(),
      numberExpressions: [count],
    };
    this._addAction(loopAction);
    this.blockPath.push(loopAction.id);
    return this;
  }

  public exitLoop(): FunctionBuilder {
    this.exitBlock();
    return this;
  }

  public build() {
    this.finished = true;
    if (!validateFunction(this.functionTree)) {
      throw new Error("Tree couldn't be built because it was invalid!");
    }
    return this.functionTree;
  }

  public getTree() {
    return this.functionTree;
  }

  private exitBlock() {
    this.blockPath.pop();
  }

  public static createNumberExpression(expressionString: string) {
    type SimpleTokenType =
      | "LParen"
      | "number"
      | "+"
      | "-"
      | "*"
      | "/"
      | "RParen";
    type SimpleToken = {
      value: string;
      type: SimpleTokenType;
    };
    const tokenMatchers: { regex: RegExp; type: SimpleTokenType }[] = [
      { regex: /^\(/, type: "LParen" },
      { regex: /^\)/, type: "RParen" },
      { regex: /^\d+/, type: "number" },
      { regex: /^\+/, type: "+" },
      { regex: /^-/, type: "-" },
      { regex: /^\*/, type: "*" },
      { regex: /^\//, type: "/" },
    ];
    expressionString = expressionString.replaceAll(/\s/g, "");
    const tokens: SimpleToken[] = [];
    while (expressionString.length !== 0) {
      const token = tokenMatchers.find(({ regex }) =>
        regex.test(expressionString)
      );
      if (!token) {
        throw new Error("Invalid number expression!");
      }
      const value = token.regex.exec(expressionString)![0];
      tokens.push({
        value,
        type: token.type,
      });
      expressionString = expressionString.slice(value.length);
    }
    let tokenIndex = 0;

    function eat(type: SimpleTokenType): SimpleToken {
      if (tokens[tokenIndex].type !== type) {
        throw new Error("Invalid token for number expression");
      }
      return tokens[tokenIndex++];
    }

    function expression(
      allowedTypes: SimpleTokenType[] = ["+", "-"],
      getNextNode: () => Functions.ActionState = term
    ): Functions.ActionState {
      let node = getNextNode();
      while (
        tokens.length > tokenIndex &&
        allowedTypes.includes(tokens[tokenIndex].type)
      ) {
        const operator = tokens[tokenIndex++].type;
        node = {
          ...createEmpty.binaryarith(),
          numberExpressions: [node, getNextNode()],
          data: { operator },
        } as Functions.BinaryArithmetic;
      }
      return node;
    }

    function term() {
      return expression(["*", "/"], factor);
    }

    function factor(): Functions.ActionState {
      switch (tokens[tokenIndex].type) {
        case "number": {
          const number = eat("number");
          return {
            ...createEmpty.numberliteral(),
            data: { value: parseInt(number.value) },
          } as Functions.NumberLiteral;
        }
        case "LParen": {
          eat("LParen");
          const node = expression();
          eat("RParen");
          return node;
        }
        default: {
          throw eat("number");
        }
      }
    }
    return expression();
  }
}
