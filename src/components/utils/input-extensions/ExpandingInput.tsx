import { Utils } from "@/src/types/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const ExpandingInput = forwardRef<
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
        {props.value || props.placeholder}
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
