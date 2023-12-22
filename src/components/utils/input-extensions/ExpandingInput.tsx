import { forwardRef, InputHTMLAttributes } from "react";

import { Utils } from "@/src/types/utils";

export default forwardRef<
  HTMLInputElement,
  Utils.MakeRequired<InputHTMLAttributes<HTMLInputElement>, "value">
>(function ExpandingInput(props, ref) {
  return (
    <div className="inline-block relative">
      <span
        className={props.className}
        style={{
          display: "inline-block",
          visibility: "hidden",
          whiteSpace: "pre",
        }}
      >
        {typeof props.value === "number"
          ? props.value
          : props.value || props.placeholder}
      </span>
      <input
        ref={ref}
        {...props}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          ...props.style,
        }}
      />
    </div>
  );
});
