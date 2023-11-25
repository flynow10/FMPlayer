import { IndentationWidth } from "@/src/components/functions/FunctionEditorContext";
import { Functions } from "@/src/types/functions";
import classNames from "classnames";
import { Menu } from "lucide-react";
import { HTMLAttributes, forwardRef } from "react";

type ActionProps = Omit<HTMLAttributes<HTMLDivElement>, "id"> & {
  action: Functions.ActionState;
  clone: boolean;
  ghost: boolean;
  depth: number;
  inToolBox: boolean;
  handleProps: HTMLAttributes<HTMLOrSVGElement>;
  wrapperRef?: React.Ref<HTMLDivElement>;
};

export default forwardRef<HTMLDivElement, ActionProps>(function Action(
  {
    action,
    clone,
    ghost,
    depth,
    inToolBox,
    wrapperRef,
    handleProps,
    style,
    ...divProps
  },
  ref
) {
  return (
    <div
      className={classNames("box-border", {
        "inline-block pt-1 pointer-events-none": clone,
        "opacity-50": ghost,
      })}
      ref={wrapperRef}
      style={{
        paddingLeft: `${!clone ? IndentationWidth * depth : 0}px`,
      }}
      {...divProps}
    >
      <div
        className="relative items-center flex gap-2 text-xl p-2 rounded-md border-2 border-accent dark:invert dark:text-white dark:bg-black bg-white"
        ref={ref}
        style={style}
      >
        <div
          className="h-full hover:bg-gray-400 m-1 p-1 rounded-sm"
          {...handleProps}
        >
          <Menu className="my-auto text-accent" />
        </div>
        <span>
          {action.type}: {JSON.stringify(inToolBox)}
        </span>
      </div>
    </div>
  );
});
