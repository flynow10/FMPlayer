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

export function isNodeOrChildOfNode(
  searchNode: HTMLElement,
  potentialNode: HTMLElement
): boolean {
  let current: HTMLElement | null = potentialNode;

  while (current !== null && current !== document.documentElement) {
    if (current === searchNode) {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}
