import React, { forwardRef, HTMLAttributes, useContext } from "react";

import LoopAction from "@/src/components/functions/actions/LoopAction";
import PlayAction from "@/src/components/functions/actions/PlayAction";

import { getApplicationDebugConfig } from "@/config/app";
import { FunctionEditor } from "@/src/contexts/FunctionEditor";
import { IndentationWidth } from "@/src/music/functions/core/constants";
import { getActionName } from "@/src/music/functions/utils/get-action-name";
import { Functions } from "@/src/types/functions";

import classNames from "classnames";
import { Menu, Plus } from "lucide-react";

type ActionProps = Omit<HTMLAttributes<HTMLDivElement>, "id"> & {
  action: Functions.ActionState;
  setAction: Functions.SetAction<Functions.ActionState>;
  clone: boolean;
  ghost: boolean;
  depth: number;
  childCount?: number;
  inToolBox: boolean;
  isActive?: boolean;
  handleProps: HTMLAttributes<HTMLDivElement>;
  wrapperRef?: React.Ref<HTMLDivElement>;
};

export default forwardRef<HTMLDivElement, ActionProps>(function Action(
  {
    action,
    setAction,
    clone,
    ghost,
    depth,
    childCount,
    inToolBox,
    isActive = false,
    wrapperRef,
    handleProps,
    style,
    ...divProps
  },
  ref
) {
  const functionEditorCtx = useContext(FunctionEditor);
  const isEditable = functionEditorCtx !== null;
  const HandleElement = !inToolBox ? Menu : Plus;

  const getActionComponent = () => {
    switch (action.type) {
      case "play": {
        return (
          <PlayAction
            action={action}
            setAction={setAction as Functions.SetAction<Functions.ActionState>}
          />
        );
      }
      case "loop": {
        return (
          <LoopAction
            action={action}
            clone={clone}
            inToolBox={inToolBox}
            setAction={setAction as Functions.SetAction<Functions.ActionState>}
          />
        );
      }
    }
    return <span>Missing action</span>;
  };
  const debug = getApplicationDebugConfig();
  return (
    <div
      className={classNames("box-border w-fit", {
        "inline-block pointer-events-none": clone,
        "opacity-50": ghost,
      })}
      ref={wrapperRef}
      title={debug?.showIds ? action.id : undefined}
      style={{
        paddingLeft: `${!clone ? IndentationWidth * depth : 0}px`,
      }}
      {...divProps}
    >
      <div
        className={classNames(
          "relative",
          "items-center",
          "flex",
          "gap-2",
          "p-2",
          "rounded-md",
          "border-2",
          "border-accent",
          "dark:border-inverted-accent",
          "bg-white",
          {
            "bg-accent dark:bg-inverted-accent": isActive,
          }
        )}
        ref={ref}
        style={style}
      >
        {isEditable && (
          <div
            className="h-full hover:bg-gray-400 m-1 p-1 rounded-sm"
            {...handleProps}
          >
            <HandleElement className="my-auto text-accent dark:text-inverted-accent" />
          </div>
        )}
        <span className="text-xl">{getActionName(action.type)}</span>
        {!inToolBox && getActionComponent()}
        {!clone &&
          depth > 0 &&
          new Array(depth).fill(0).map((_, index) => (
            <div
              key={index}
              className="absolute border-l-2 border-accent dark:border-inverted-accent -bottom-1 -top-2"
              style={{
                left: `-${IndentationWidth * (index + 0.5)}px`,
              }}
            ></div>
          ))}
        {clone && childCount && childCount > 1 ? (
          <span className="absolute -top-2 -right-2 rounded-[50%] flex items-center justify-center w-6 h-6 bg-accent-highlighted dark:bg-inverted-accent-highlighted">
            {childCount}
          </span>
        ) : null}
      </div>
    </div>
  );
});
