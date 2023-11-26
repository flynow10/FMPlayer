import Action from "@/src/components/functions/Action";
import ActionList from "@/src/components/functions/ActionList";
import Trash from "@/src/components/functions/Trash";
import TrackLiteral from "@/src/components/functions/draggables/TrackLiteral";
import { fadeOutAnimationConfig } from "@/src/components/functions/utils/fade-out-animation";
import { FunctionEditor } from "@/src/contexts/FunctionEditor";
import { generateGroupId } from "@/src/music/functions/utils/generate-group-id";
import { Functions } from "@/src/types/functions";
import { DragOverlay } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import classNames from "classnames";
import { useContext } from "react";
import { createPortal } from "react-dom";

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
  const { activeId, activeGroup } = useContext(FunctionEditor);
  return (
    <div className="border-r-2 flex flex-col">
      <span className="border-b-2 text-2xl text-center p-2">Toolbox</span>
      <ActionList>
        <span className="text-xl border-b-2">Control</span>
        {toolboxActionsTypes.map((action) => (
          <Action
            key={action.type}
            action={action}
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
        <div className="dark:invert">
          <TrackLiteral
            id={generateGroupId("tracks")}
            trackId=""
            inToolBox
            setTrackId={() => {}}
          />
          {createPortal(
            <DragOverlay
              dropAnimation={fadeOutAnimationConfig}
              modifiers={[restrictToWindowEdges]}
            >
              {activeId && activeGroup === "tracks" ? (
                <div className="dark:invert">
                  <TrackLiteral
                    id={activeId}
                    trackId=""
                    inToolBox
                    setTrackId={() => {}}
                  />
                </div>
              ) : null}
            </DragOverlay>,
            document.body
          )}
        </div>
      </ActionList>
      <Trash>
        {(isOver, ref) => (
          <div
            ref={ref}
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
        )}
      </Trash>
    </div>
  );
}
