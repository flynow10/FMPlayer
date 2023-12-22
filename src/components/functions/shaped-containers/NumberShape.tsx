import { forwardRef,HTMLAttributes, ReactNode } from "react";

type NumberShapeProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export default forwardRef<HTMLDivElement, NumberShapeProps>(
  function NumberShape({ children, style, ...props }, ref) {
    return (
      <div
        ref={ref}
        style={{
          padding: "0.25em",
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
