import NumberShape from "@/src/components/functions/shaped-containers/NumberShape";
import { ExpandingInput } from "@/src/components/utils/input-extensions/ExpandingInput";
import { FunctionEditor } from "@/src/contexts/FunctionEditor";
import classNames from "classnames";
import { useContext } from "react";

type NumberLiteralProps = {
  id: string;
  value: number;
  setValue: (value: number) => void;
  disabled: boolean;
};

export default function NumberLiteral(props: NumberLiteralProps) {
  const functionEditorCtx = useContext(FunctionEditor);
  const isEditable = functionEditorCtx !== null;
  return (
    <NumberShape
      className={classNames(
        "bg-green-500",
        "dark:bg-[rgb(221_58_161)]",
        "overflow-hidden",
        "flex",
        "items-center"
      )}
    >
      <span className="flex gap-2 items-center">
        <ExpandingInput
          type="number"
          className={classNames(
            "py-1",
            "p-2",
            "rounded-full",
            "bg-white",
            "dark:invert",
            {
              "disabled:bg-gray-300": isEditable,
            }
          )}
          value={props.value.toString()}
          disabled={props.disabled || !isEditable}
          onChange={(event) => {
            props.setValue(event.target.valueAsNumber);
          }}
        />
      </span>
    </NumberShape>
  );
}
