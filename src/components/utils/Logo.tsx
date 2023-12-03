import { HTMLAttributes, forwardRef } from "react";
import logoSrc from "/colorIcon.svg";

export const Logo = forwardRef<
  HTMLImageElement,
  Omit<HTMLAttributes<HTMLImageElement>, "src">
>(function Logo(props, ref) {
  return (
    <img ref={ref} src={logoSrc} {...props} style={{ filter: "invert(0)" }} />
  );
});
