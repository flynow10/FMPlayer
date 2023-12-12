import { generateActionId } from "@/src/music/functions/utils/generate-action-id";
import { Functions } from "@/src/types/functions";

type GeneratorMap = {
  play: () => Functions.ActionState;
  loop: () => Functions.ActionState;
  numberliteral: () => Functions.NumberLiteral;
  binaryarith: () => Functions.BinaryArithmetic;
  trackliteral: () => Functions.TrackLiteral;
};

export const createEmpty: GeneratorMap = {
  loop() {
    return {
      id: generateActionId("actions", "loop"),
      childNodes: [],
      group: "actions",
      numberExpressions: [null],
      trackExpressions: [],
      type: "loop",
    };
  },
  play() {
    return {
      id: generateActionId("actions", "play"),
      childNodes: [],
      group: "actions",
      numberExpressions: [],
      trackExpressions: [null],
      type: "play",
    };
  },
  binaryarith() {
    return {
      id: generateActionId("numbers", "binaryarith"),
      childNodes: [],
      data: {
        operator: "+",
      },
      group: "numbers",
      numberExpressions: [null, null],
      trackExpressions: [],
      type: "binaryarith",
    } as Functions.BinaryArithmetic;
  },
  numberliteral() {
    return {
      id: generateActionId("numbers", "numberliteral"),
      type: "numberliteral",
      childNodes: [],
      data: {
        value: 0,
      },
      group: "numbers",
      numberExpressions: [],
      trackExpressions: [],
    };
  },
  trackliteral() {
    return {
      id: generateActionId("tracks", "trackliteral"),
      childNodes: [],
      data: {
        trackId: "",
      },
      group: "tracks",
      numberExpressions: [],
      trackExpressions: [],
      type: "trackliteral",
    };
  },
} satisfies Record<Functions.ActionType, () => Functions.ActionState>;
