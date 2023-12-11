import NumberShape from "@/src/components/functions/shaped-containers/NumberShape";
import classNames from "classnames";
import { HTMLAttributes, ReactNode, forwardRef } from "react";

type NumberShapeInsertProps = HTMLAttributes<HTMLDivElement> & {
  over?: boolean;
  children?: ReactNode;
};

export default forwardRef<HTMLDivElement, NumberShapeInsertProps>(
  function NumberShapeInsert({ children, over, ...props }, ref) {
    return (
      <NumberShape
        ref={ref}
        className={classNames("px-2", "border-2", {
          "dark:bg-gray-200 bg-gray-400 border-accent dark:border-inverted-accent":
            over,
          "bg-gray-300 border-transparent": !over,
        })}
        {...props}
      >
        {children}
      </NumberShape>
    );
  }
);
