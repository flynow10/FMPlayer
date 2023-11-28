import TrackShape from "@/src/components/functions/shaped-containers/TrackShape";
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
        className={classNames("px-2", {
          "dark:bg-gray-200 bg-gray-400 border-accent dark:border-inverted-accent border-2":
            over,
          "bg-gray-300": !over,
        })}
        {...props}
      >
        {children}
      </TrackShape>
    );
  }
);
