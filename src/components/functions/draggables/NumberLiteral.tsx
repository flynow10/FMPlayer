import NumberShape from "@/src/components/functions/shaped-containers/NumberShape";
import { ExpandingInput } from "@/src/components/utils/input-extensions/ExpandingInput";
import { FunctionEditor } from "@/src/contexts/FunctionEditor";
import { useDraggable } from "@dnd-kit/core";
import classNames from "classnames";
import { Menu } from "lucide-react";
import { useContext } from "react";

type NumberLiteralProps = {
  id: string;
  value: number;
  setValue: (value: number) => void;
  clone: boolean;
  inToolBox: boolean;
};

export default function NumberLiteral(props: NumberLiteralProps) {
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
        Number Literal:
        <ExpandingInput
          type="number"
          className="py-1 p-2 rounded-full bg-white dark:invert"
          value={props.value}
          onChange={(event) => {
            props.setValue(event.target.valueAsNumber);
          }}
        />
      </span>
    </NumberShape>
  );
}
