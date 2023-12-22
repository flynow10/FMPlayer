import { forwardRef,HTMLAttributes, ReactNode } from "react";

type TrackShapeProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export default forwardRef<HTMLDivElement, TrackShapeProps>(function TrackShape(
  { children, style, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      style={{
        borderRadius: "9999px",
        padding: "0.25em",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
});
