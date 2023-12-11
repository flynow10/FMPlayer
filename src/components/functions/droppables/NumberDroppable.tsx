import BinaryArithmetic from "@/src/components/functions/draggables/BinaryArithmetic";
import NumberLiteral from "@/src/components/functions/draggables/NumberLiteral";
import NumberShapeInsert from "@/src/components/functions/shaped-containers/NumberShapeInsert";
import { generateGroupId } from "@/src/music/functions/utils/generate-group-id";
import { Functions } from "@/src/types/functions";
import { useDroppable } from "@dnd-kit/core";

type NumberDroppableProps = {
  parentId: string;
  index?: number;
  disabled?: boolean;
  numberExpression: Functions.NumberExpression | null;
  setNumberExpression: Functions.SetNumberExpression;
};

export default function NumberDroppable({
  parentId,
  index = 0,
  disabled,
  numberExpression,
  setNumberExpression,
}: NumberDroppableProps) {
  const id = generateGroupId("numbers", "drop", parentId, index);
  const { setNodeRef, isOver } = useDroppable({
    id,
    disabled,
  });
  let contents = <span>Number Expression</span>;
  if (numberExpression !== null) {
    switch (numberExpression.type) {
      case "literal": {
        contents = (
          <NumberLiteral
            id={numberExpression.id}
            value={numberExpression.value}
            inToolBox={false}
            clone={false}
            setValue={(value) => {
              setNumberExpression((prev) =>
                prev !== null && prev.type === "literal"
                  ? { ...prev, value }
                  : { id: numberExpression.id, value, type: "literal" }
              );
            }}
          />
        );
        break;
      }
      case "binaryarith": {
        const setOperands =
          (side: "left" | "right") =>
          (value: React.SetStateAction<Functions.NumberExpression | null>) => {
            setNumberExpression((prevExpression) => {
              let newNumberExpression: Functions.NumberExpression | null;
              if (typeof value === "function") {
                newNumberExpression = value(prevExpression);
              } else {
                newNumberExpression = value;
              }
              if (prevExpression && prevExpression.type === "binaryarith") {
                return {
                  ...prevExpression,
                  [side]: newNumberExpression,
                };
              } else {
                return {
                  id: numberExpression.id,
                  left: null,
                  right: null,
                  op: "+",
                  type: "binaryarith",
                  [side]: newNumberExpression,
                };
              }
            });
          };
        contents = (
          <BinaryArithmetic
            id={numberExpression.id}
            inToolBox={false}
            clone={false}
            left={numberExpression.left}
            right={numberExpression.right}
            op={numberExpression.op}
            setOp={(op) => {
              setNumberExpression((prev) => {
                if (prev !== null && prev.type === "binaryarith") {
                  return { ...prev, op };
                } else {
                  return {
                    id: numberExpression.id,
                    left: null,
                    op,
                    right: null,
                    type: "binaryarith",
                  };
                }
              });
            }}
            setLeft={setOperands("left")}
            setRight={setOperands("right")}
          />
        );
      }
    }
  }
  return (
    <NumberShapeInsert ref={setNodeRef} over={isOver}>
      {contents}
    </NumberShapeInsert>
  );
}
