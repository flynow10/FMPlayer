import { ReactNode, useEffect, useRef } from "react";

type MinWidthOption = {
  left: number;
  right: number;
};
type VerticalSplitProps = {
  left: ReactNode;
  right: ReactNode;
  minWidth?: number | MinWidthOption;
  defaultPosition?: "left" | "middle" | "right";
};

function getMinWidth(minWidth: number | MinWidthOption): MinWidthOption {
  let left = 0;
  let right = 0;
  if (typeof minWidth === "number") {
    left = minWidth;
    right = minWidth;
  } else if (typeof minWidth === "object") {
    left = minWidth.left;
    right = minWidth.right;
  }
  return {
    left,
    right,
  };
}

export default function VerticalSplit(props: VerticalSplitProps) {
  const defaultPosition = props.defaultPosition ?? "middle";
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const handlerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isDragging = false;
    const mouseDown = (e: MouseEvent) => {
      if (e.target === handlerRef.current) {
        e.preventDefault();
        isDragging = true;
      }
    };

    const mouseMove = (e: MouseEvent) => {
      if (!isDragging) {
        return;
      }
      e.preventDefault();
      const containerBoundingRect = wrapperRef.current?.getBoundingClientRect();
      const containerOffsetLeft = containerBoundingRect?.left ?? 0;
      const containerOffsetWidth = containerBoundingRect?.width ?? Infinity;

      const minWidth = getMinWidth(props.minWidth ?? 0);

      const pointerRelativeXpos = e.clientX - containerOffsetLeft;

      if (leftRef.current) {
        leftRef.current.style.width =
          Math.min(
            containerOffsetWidth - minWidth.right,
            Math.max(minWidth.left, pointerRelativeXpos - 1)
          ) + "px";
        leftRef.current.style.maxWidth = "";
        leftRef.current.style.flexGrow = "0";
        leftRef.current.style.flexShrink = "0";
      }
      if (rightRef.current) {
        rightRef.current.style.flexShrink = "0";
        rightRef.current.style.flexGrow = "0";
        rightRef.current.style.width =
          Math.min(
            containerOffsetWidth - minWidth.left,
            Math.max(
              minWidth.right,
              containerOffsetWidth - pointerRelativeXpos - 1
            )
          ) + "px";
        rightRef.current.style.maxWidth = "";
      }
    };

    const mouseUp = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
      }
      isDragging = false;
    };

    document.addEventListener("mousedown", mouseDown);
    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mouseup", mouseUp);

    return () => {
      document.removeEventListener("mousedown", mouseDown);
      document.removeEventListener("mousemove", mouseMove);
      document.removeEventListener("mouseup", mouseUp);
    };
  }, [props.minWidth]);

  let defaultLeftWidth = "";
  let defaultRightWidth = "";
  switch (defaultPosition) {
    case "left": {
      defaultLeftWidth = props.minWidth
        ? getMinWidth(props.minWidth).left + "px"
        : "min-content";
      break;
    }
    case "middle": {
      defaultLeftWidth = "50%";
      defaultRightWidth = "50%";
      break;
    }
    case "right": {
      defaultRightWidth = props.minWidth
        ? getMinWidth(props.minWidth).right + "px"
        : "min-content";
      break;
    }
  }

  return (
    <div ref={wrapperRef} className="flex flex-row h-full relative">
      <div
        ref={leftRef}
        className="grow box-border"
        style={{
          minWidth: props.minWidth
            ? getMinWidth(props.minWidth).left + "px"
            : "",
          maxWidth: defaultLeftWidth,
        }}
      >
        {props.left}
      </div>
      <div className="grow-0 w-0 h-full relative">
        <div
          ref={handlerRef}
          className="absolute h-full border top-0 left-0 cursor-ew-resize pointer-events-auto z-10"
        ></div>
      </div>
      <div
        ref={rightRef}
        className="grow box-border"
        style={{
          minWidth: props.minWidth
            ? getMinWidth(props.minWidth).right + "px"
            : "",
          maxWidth: defaultRightWidth,
        }}
      >
        {props.right}
      </div>
    </div>
  );
}
