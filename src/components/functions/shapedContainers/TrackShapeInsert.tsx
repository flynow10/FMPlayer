import TrackShape from "@/src/components/functions/shapedContainers/TrackShape";
import classNames from "classnames";
import { HTMLAttributes, ReactNode, forwardRef } from "react";

type TrackShapeInsertProps = HTMLAttributes<HTMLDivElement> & {
  over?: boolean;
  children?: ReactNode;
};

export default forwardRef<HTMLDivElement, TrackShapeInsertProps>(
  function TrackShapeInsert({ children, over, ...props }, ref) {
    return (
      <TrackShape
        ref={ref}
        className={classNames({
          "px-2": !children,
          "bg-gray-900 border-accent border-2": over,
          "bg-gray-700": !over,
        })}
        {...props}
      >
        {!children ? <span>Track Input</span> : children}
      </TrackShape>
    );
  }
);
