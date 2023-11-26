import Action from "@/src/components/functions/Action";
import ActionList from "@/src/components/functions/ActionList";
import Trash from "@/src/components/functions/Trash";
import TrackLiteral from "@/src/components/functions/draggables/TrackLiteral";
import { generateGroupId } from "@/src/music/functions/utils/generate-group-id";
import { Functions } from "@/src/types/functions";
import classNames from "classnames";
import { Trash2 } from "lucide-react";

type ToolboxProps = {
  setFunctionTree: Functions.SetFunctionTree;
};

const toolboxActionsTypes: Functions.ActionState[] = [
  {
    id: generateGroupId("actions"),
    children: [],
    type: "play",
    trackExpression: null,
  },
  {
    id: generateGroupId("actions"),
    children: [],
    type: "loop",
  },
];

export default function Toolbox({ setFunctionTree }: ToolboxProps) {
  return (
    <div className="border-r-2 flex flex-col">
      <span className="border-b-2 text-2xl text-center p-2">Toolbox</span>
      <ActionList>
        <span className="text-xl border-b-2">Control</span>
        {toolboxActionsTypes.map((action) => (
          <Action
            key={action.type}
            action={action}
            setAction={() => {}}
            clone={false}
            ghost={false}
            depth={0}
            handleProps={{
              onClick: () => {
                setFunctionTree((prev) => {
                  return [
                    ...prev,
                    {
                      ...action,
                      id: generateGroupId("actions"),
                      children: [],
                    },
                  ];
                });
              },
              style: { cursor: "pointer" },
            }}
            inToolBox
          />
        ))}
        <span className="text-xl border-b-2">Literals</span>
        <TrackLiteral
          id={generateGroupId("tracks")}
          trackId=""
          inToolBox
          clone={false}
          setTrackId={() => {}}
        />
      </ActionList>
      <Trash>
        {(isOver, ref) => (
          <div
            ref={ref}
            className={classNames(
              "dark:invert",
              "text-white",
              "border-accent",
              "border-t-2",
              "p-4",
              "flex",
              "items-center",
              "gap-2",
              "transition-colors",
              {
                black: !isOver,
                "bg-red-600": isOver,
              }
            )}
          >
            <Trash2 />
            <div className="overflow-hidden grow relative">
              <span
                className={classNames(
                  "text-xl",
                  "mx-auto",
                  "relative",
                  "-left-full",
                  "transition-[left]",
                  {
                    "left-0": isOver,
                  }
                )}
              >
                Remove
              </span>
            </div>
          </div>
        )}
      </Trash>
    </div>
  );
}
