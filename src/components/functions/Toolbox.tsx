import Action from "@/src/components/functions/Action";
import ActionList from "@/src/components/functions/ActionList";
import { TRASH_ID } from "@/src/components/functions/FunctionEditorContext";
import { Functions } from "@/src/types/functions";
import { useDroppable } from "@dnd-kit/core";
import classNames from "classnames";
import { v4 as uuid } from "uuid";

type ToolboxProps = {
  setFunctionTree: Functions.SetFunctionTree;
};

const toolboxActionsTypes: Functions.ActionType[] = ["play", "loop"];

export default function Toolbox({ setFunctionTree }: ToolboxProps) {
  const { setNodeRef: setDeleteNodeRef, isOver } = useDroppable({
    id: TRASH_ID,
  });

  return (
    <div className="border-r-2 flex flex-col">
      <span className="border-b-2 text-2xl text-center p-2">Toolbox</span>
      <ActionList>
        {toolboxActionsTypes.map((actionType) => (
          <Action
            key={actionType}
            action={{ id: uuid(), children: [], type: actionType }}
            clone={false}
            ghost={false}
            depth={0}
            handleProps={{
              onClick: () => {
                setFunctionTree((prev) => {
                  return [
                    ...prev,
                    {
                      id: uuid(),
                      children: [],
                      type: actionType,
                    },
                  ];
                });
              },
              style: { cursor: "pointer" },
            }}
            inToolBox
          />
        ))}
      </ActionList>
      <div
        ref={setDeleteNodeRef}
        className={classNames(
          "dark:invert",
          "text-center",
          "text-white",
          "border-accent",
          "border-t-2",
          "p-4",
          {
            "bg-red-500": !isOver,
            "bg-red-600": isOver,
          }
        )}
      >
        <span className="text-xl">Delete</span>
      </div>
    </div>
  );
}
