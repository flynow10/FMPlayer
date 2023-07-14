import {
  RenderSuggestion,
  SuggestionAttributes,
} from "@/src/components/utils/input-extensions/BaseSuggestionInput";
import Item from "@/src/components/utils/input-extensions/SuggestionItem";
import { mergeClasses } from "@/src/utils/component-utils";
import { HTMLAttributes, RefCallback } from "react";

type SuggestionListProps<S> = {
  suggestions: S[];
  getSuggestionValue: (suggestion: S) => string;
  renderSuggestion: RenderSuggestion<S>;

  highlightedSuggestion: number | null;
  query: string;

  itemProps?: SuggestionAttributes;

  containerProps?: HTMLAttributes<HTMLUListElement>;
  containerRef?: RefCallback<HTMLUListElement>;
};

export default function SuggestionList<S>(props: SuggestionListProps<S>) {
  const hiddenClass: { className?: string } = {};
  if (props.suggestions.length === 0) {
    hiddenClass.className = "hidden";
  }
  return (
    <ul
      {...mergeClasses(
        props.containerProps ?? {},
        "absolute",
        "bg-white",
        "top-full",
        "translate-y-1",
        "w-full",
        "left-0"
      )}
      {...hiddenClass}
      ref={props.containerRef}
    >
      {props.suggestions.map((suggestion, index) => {
        const itemProps = {
          "data-suggestion-index": index,
          ...props.itemProps,
        };
        return (
          <Item
            itemProps={itemProps}
            key={props.getSuggestionValue(suggestion)}
            suggestion={suggestion}
            suggestionIndex={index}
            isHighlighted={index === props.highlightedSuggestion}
            query={props.query}
            renderSuggestion={props.renderSuggestion}
          />
        );
      })}
    </ul>
  );
}
