import Action from "@/src/components/functions/Action";
import ActionList from "@/src/components/functions/ActionList";
import BinaryArithmetic from "@/src/components/functions/draggables/BinaryArithmetic";
import TrackLiteral from "@/src/components/functions/draggables/TrackLiteral";
import Trash from "@/src/components/functions/Trash";

import { createEmpty } from "@/src/music/functions/utils/create-empty";
import { generateActionId } from "@/src/music/functions/utils/generate-action-id";
import { Functions } from "@/src/types/functions";

import classNames from "classnames";
import { Trash2 } from "lucide-react";

type ToolboxProps = {
  setFunctionTree: Functions.SetFunctionTree;
};

const toolboxActionsTypes: Functions.ActionState[] = [
  createEmpty.play(),
  createEmpty.loop(),
];

export default function Toolbox({ setFunctionTree }: ToolboxProps) {
  return (
    <div className="border-r-2 flex flex-col shrink-0">
      <span className="border-b-2 text-2xl text-center p-2">Toolbox</span>
      <ActionList>
        <span className="text-xl border-b-2 pb-2 mb-4">Control</span>
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
                  return [...prev, createEmpty[action.type]()];
                });
              },
              style: { cursor: "pointer" },
            }}
            inToolBox
          />
        ))}
        <span className="text-xl border-b-2 pb-2 mb-4">Literals</span>
        <div className="flex flex-col gap-4 items-start">
          <TrackLiteral
            id={generateActionId("tracks", "trackliteral")}
            trackId=""
            inToolBox
            clone={false}
            setTrackId={() => {}}
          />
          <BinaryArithmetic
            id={generateActionId("numbers", "binaryarith")}
            left={null}
            right={null}
            op="+"
            setLeft={() => {}}
            setOp={() => {}}
            setRight={() => {}}
            inToolBox
            clone={false}
          />
        </div>
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
