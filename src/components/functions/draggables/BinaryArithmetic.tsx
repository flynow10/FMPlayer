import NumberDroppable from "@/src/components/functions/droppables/NumberDroppable";
import NumberShape from "@/src/components/functions/shaped-containers/NumberShape";
import { FunctionEditor } from "@/src/contexts/FunctionEditor";
import { Functions } from "@/src/types/functions";
import { useDraggable } from "@dnd-kit/core";
import classNames from "classnames";
import { Menu } from "lucide-react";
import { useContext } from "react";

type BinaryArithmeticProps = {
  id: string;
  op: Functions.BinaryOp;
  setOp: (newOp: Functions.BinaryOp) => void;
  left: Functions.NumberExpression | null;
  setLeft: Functions.SetNumberExpression;
  right: Functions.NumberExpression | null;
  setRight: Functions.SetNumberExpression;
  clone: boolean;
  inToolBox: boolean;
};

export default function BinaryArithmetic(props: BinaryArithmeticProps) {
  const functionEditorCtx = useContext(FunctionEditor);
  const isEditable = functionEditorCtx !== null;
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, isDragging } =
    useDraggable({
      id: props.id,
    });
  return (
    <NumberShape
      ref={setNodeRef}
      className={classNames(
        "bg-green-500",
        "dark:bg-[rgb(221_58_161)]",
        "overflow-hidden",
        "flex",
        "items-center",
        {
          "opacity-20": isDragging,
          "pointer-events-none": props.clone,
        }
      )}
    >
      {isEditable && (
        <div
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="p-2"
        >
          <Menu />
        </div>
      )}
      <span className="flex gap-2 items-center">
        <NumberDroppable
          parentId={props.id}
          index={0}
          disabled={props.inToolBox}
          numberExpression={props.left}
          setNumberExpression={props.setLeft}
        />
        <span>{props.op}</span>
        <NumberDroppable
          parentId={props.id}
          index={1}
          disabled={props.inToolBox}
          numberExpression={props.right}
          setNumberExpression={props.setRight}
        />
      </span>
    </NumberShape>
  );
}
