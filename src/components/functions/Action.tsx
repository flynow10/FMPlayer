import { IndentationWidth } from "@/src/components/functions/FunctionEditorContext";
import { Functions } from "@/src/types/functions";
import classNames from "classnames";
import { Menu, Plus } from "lucide-react";
import { HTMLAttributes, forwardRef } from "react";

type ActionProps = Omit<HTMLAttributes<HTMLDivElement>, "id"> & {
  action: Functions.ActionState;
  clone: boolean;
  ghost: boolean;
  depth: number;
  childCount?: number;
  inToolBox: boolean;
  handleProps: HTMLAttributes<HTMLDivElement>;
  wrapperRef?: React.Ref<HTMLDivElement>;
};

export default forwardRef<HTMLDivElement, ActionProps>(function Action(
  {
    action,
    clone,
    ghost,
    depth,
    childCount,
    inToolBox,
    wrapperRef,
    handleProps,
    style,
    ...divProps
  },
  ref
) {
  const HandleElement = !inToolBox ? Menu : Plus;
  return (
    <div
      className={classNames("box-border w-fit", {
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
          <HandleElement className="my-auto text-accent" />
        </div>
        <span>
          {action.type}: {JSON.stringify(inToolBox)}
        </span>
        {!clone &&
          depth > 0 &&
          new Array(depth).fill(0).map((_, index) => (
            <div
              key={index}
              className="absolute border-l-2 border-accent -bottom-1 -top-2"
              style={{
                left: `-${IndentationWidth * (index + 0.5)}px`,
              }}
            ></div>
          ))}
        {clone && childCount && childCount > 1 ? (
          <span className="absolute -top-2 -right-2 rounded-[50%] flex items-center justify-center w-6 h-6 bg-accent-highlighted">
            {childCount}
          </span>
        ) : null}
      </div>
    </div>
  );
});
