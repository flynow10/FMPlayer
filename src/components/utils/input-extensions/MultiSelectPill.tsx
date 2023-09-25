import { InputExtensions } from "@/src/types/input-extensions";
import { X } from "lucide-react";
import { MouseEvent } from "react";

type MultiSelectPillProps = {
  item: string;
  index: number;
  onDelete: (
    event: MouseEvent<HTMLButtonElement>,
    params: InputExtensions.MultiSelect.MultiSelectPillDeleteParams
  ) => void;
};

export default function MultiSelectPill(props: MultiSelectPillProps) {
  return (
    <div className="m-1 p-1 rounded-md bg-gray-400 flex flex-row gap-1">
      <div className="border-r-2 border-black pr-1">
        <button
          className="group flex flex-row rounded-md hover:bg-gray-500 hover:text-red-600"
          onClick={(event) => {
            props.onDelete(event, { item: props.item, index: props.index });
          }}
        >
          <X className="group-hover:invert" />
        </button>
      </div>
      <span className="px-1 whitespace-nowrap">{props.item}</span>
    </div>
  );
}
