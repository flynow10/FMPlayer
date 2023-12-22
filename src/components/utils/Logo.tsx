import { forwardRef, HTMLAttributes } from "react";

import logoSrc from "/colorIcon.svg";

export default forwardRef<
  HTMLImageElement,
  Omit<HTMLAttributes<HTMLImageElement>, "src">
>(function Logo(props, ref) {
  return (
    <img ref={ref} src={logoSrc} {...props} style={{ filter: "invert(0)" }} />
  );
});
