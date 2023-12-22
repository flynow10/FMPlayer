import { useContext } from "react";

import NumberDroppable from "@/src/components/functions/droppables/NumberDroppable";
import NumberShape from "@/src/components/functions/shaped-containers/NumberShape";

import { FunctionEditor } from "@/src/contexts/FunctionEditor";
import { Functions } from "@/src/types/functions";

import { useDraggable } from "@dnd-kit/core";
import classNames from "classnames";
import { Divide, LucideIcon, Menu, Minus, Plus, X } from "lucide-react";

type BinaryArithmeticProps = {
  id: string;
  op: Functions.BinaryOp;
  setOp: (newOp: Functions.BinaryOp) => void;
  left: Functions.ActionState | null;
  setLeft: Functions.SetAction;
  right: Functions.ActionState | null;
  setRight: Functions.SetAction;
  clone: boolean;
  inToolBox: boolean;
};

const operatorCycle: Functions.BinaryOp[] = ["+", "-", "*", "/"];

const operatorIcons: Record<Functions.BinaryOp, LucideIcon> = {
  "+": Plus,
  "-": Minus,
  "*": X,
  "/": Divide,
};

export default function BinaryArithmetic(props: BinaryArithmeticProps) {
  const functionEditorCtx = useContext(FunctionEditor);
  const isEditable = functionEditorCtx !== null;
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, isDragging } =
    useDraggable({
      id: props.id,
    });
  const OperatorIcon = operatorIcons[props.op];
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
          clone={props.clone}
          inToolBox={props.inToolBox}
          numberExpression={props.left}
          setNumberExpression={props.setLeft}
        />
        <button
          className={classNames("rounded-md", "p-1", {
            "disabled:text-gray-700": isEditable,
            "hover:bg-gray-300": isEditable,
          })}
          disabled={props.clone || props.inToolBox || !isEditable}
          onClick={() => {
            const nextOp =
              operatorCycle[
                (operatorCycle.indexOf(props.op) + 1) % operatorCycle.length
              ];
            props.setOp(nextOp);
          }}
        >
          <OperatorIcon />
        </button>
        <NumberDroppable
          parentId={props.id}
          index={1}
          clone={props.clone}
          inToolBox={props.inToolBox}
          numberExpression={props.right}
          setNumberExpression={props.setRight}
        />
      </span>
    </NumberShape>
  );
}
