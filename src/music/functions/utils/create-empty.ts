import { generateGroupId } from "@/src/music/functions/utils/generate-group-id";
import { Functions } from "@/src/types/functions";

type GeneratorMap = {
  actions: {
    play: () => Functions.PlayActionState;
    loop: () => Functions.LoopActionState;
  };
  numbers: {
    literal: () => Functions.NumberLiteral;
    binaryarith: () => Functions.BinaryArithmetic;
  };
  tracks: {
    literal: () => Functions.TrackLiteral;
  };
};

export const createEmpty: GeneratorMap = {
  actions: {
    loop() {
      return {
        id: generateGroupId("actions", "loop"),
        children: [],
        numberExpression: null,
        type: "loop",
      };
    },
    play() {
      return {
        id: generateGroupId("actions", "play"),
        children: [],
        trackExpression: null,
        type: "play",
      };
    },
  },
  numbers: {
    binaryarith() {
      return {
        id: generateGroupId("numbers", "binaryarith"),
        left: null,
        op: "+",
        right: null,
        type: "binaryarith",
      };
    },
    literal() {
      return {
        id: generateGroupId("numbers", "literal"),
        type: "literal",
        value: 0,
      };
    },
  },
  tracks: {
    literal() {
      return {
        id: generateGroupId("tracks", "literal"),
        trackId: "",
        type: "literal",
      };
    },
  },
};
