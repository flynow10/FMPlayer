import { InputExtensions } from "@/src/types/input-extensions";
import { LiHTMLAttributes, MouseEvent } from "react";

type ItemProps<S> = {
  suggestion: S;
  suggestionIndex: number;
  isHighlighted: boolean;
  query: string;
  renderSuggestion: InputExtensions.RenderSuggestion<S>;
  itemProps?: InputExtensions.SuggestionAttributes;
};

// eslint-disable-next-line react/no-multi-comp
export default function Item<S>(props: ItemProps<S>) {
  const {
    suggestion,
    suggestionIndex,
    renderSuggestion,
    isHighlighted,
    query,
  } = props;
  let allItemProps: LiHTMLAttributes<HTMLLIElement> = {};
  if (props.itemProps !== undefined) {
    const { onMouseEnter, onMouseLeave, onMouseDown, onClick, ...normalProps } =
      props.itemProps;
    allItemProps = { ...normalProps };
    const internalOnMouseEnter = (event: MouseEvent<HTMLLIElement>) => {
      onMouseEnter?.(event, suggestionIndex);
    };
    const internalOnMouseLeave = (event: MouseEvent<HTMLLIElement>) => {
      onMouseLeave?.(event, suggestionIndex);
    };
    const internalOnMouseDown = (event: MouseEvent<HTMLLIElement>) => {
      onMouseDown?.(event, suggestionIndex);
    };
    const internalOnClick = (event: MouseEvent<HTMLLIElement>) => {
      onClick?.(event, suggestionIndex);
    };
    if (onMouseEnter !== undefined) {
      allItemProps.onMouseEnter = internalOnMouseEnter;
    }
    if (onMouseLeave !== undefined) {
      allItemProps.onMouseLeave = internalOnMouseLeave;
    }
    if (onMouseDown !== undefined) {
      allItemProps.onMouseDown = internalOnMouseDown;
    }
    if (onClick !== undefined) {
      allItemProps.onClick = internalOnClick;
    }
  }
  return (
    <li role="option" className="cursor-pointer" {...allItemProps}>
      {renderSuggestion(suggestion, { isHighlighted, query })}
    </li>
  );
}
