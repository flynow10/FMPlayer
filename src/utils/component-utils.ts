import classNames from "classnames";

export function mergeClasses<T extends object & { className?: string }>(
  props: T,
  ...requiredClasses: string[]
) {
  const { className: propClasses, ...otherProps } = props ?? {};
  const newClasses = classNames(
    ...requiredClasses,
    ...(propClasses?.split(" ") ?? [])
  );

  return { className: newClasses, ...otherProps };
}
