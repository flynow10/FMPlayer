import BaseSuggestionInput from "@/src/components/utils/input-extensions/BaseSuggestionInput";
import MultiSelectPill from "@/src/components/utils/input-extensions/MultiSelectPill";
import { InputExtensions } from "@/src/types/input-extensions";
import { isNodeOrChildOfNode } from "@/src/utils/component-utils";
import { HTMLAttributes, useRef, useState } from "react";

type MultiSuggestionInputProps<S> = {
  suggestions: S[];
  getSuggestionValue: InputExtensions.GetSuggestionValue<S>;
  renderSuggestion: InputExtensions.RenderSuggestion<S>;

  selectedItems: string[];
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
  isValidItem?: (item: string) => boolean;

  onChange?: InputExtensions.ChangeEventHandler;
  addCurrentTextOnBlur?: boolean;

  shouldRenderSuggestions?: InputExtensions.ShouldRenderSuggestions;

  onSuggestionFetchRequested: (
    request: InputExtensions.SuggestionsFetchRequestedParams & {
      addedItems?: string[];
    }
  ) => void;
  onSuggestionClearRequested?: () => void;

  outerContainerProps?: HTMLAttributes<HTMLDivElement>;
  suggestionContainerProps?: HTMLAttributes<HTMLUListElement>;
};

export default function MultiSuggestionInput<S>(
  props: MultiSuggestionInputProps<S>
) {
  const [text, setText] = useState("");
  const inputElement = useRef<HTMLInputElement | null>(null);
  const inputContainer = useRef<HTMLDivElement>(null);

  const isValidItem = (item: string) => {
    return (
      item.trim().length > 0 &&
      !props.selectedItems.includes(item) &&
      (props.isValidItem ?? (() => true))(item)
    );
  };

  const selectItem = (item: string) => {
    if (isValidItem(item)) {
      props.setSelectedItems((prev) => [...prev, item]);
      setText("");
    }
  };

  const removeElement = (toRemoveIndex: number, shouldMoveToText = false) => {
    if (toRemoveIndex >= 0 && toRemoveIndex < props.selectedItems.length) {
      const element = props.selectedItems[toRemoveIndex];
      props.setSelectedItems((prev) =>
        prev.filter((item, index) => {
          return index !== toRemoveIndex;
        })
      );
      if (shouldMoveToText) {
        setText(element);
      }
    }
  };
  return (
    <BaseSuggestionInput
      suggestions={props.suggestions}
      getSuggestionValue={props.getSuggestionValue}
      inputProps={{
        className: "outline-none p-2 grow min-w-0",
        onChange: (event, params) => {
          if (params.method !== "click") {
            props.onChange?.(event, params);
            setText(params.newValue);
          }
        },
        onKeyDown: (event) => {
          if (
            event.key === "Enter" &&
            // Prevent IME keyboards from registering a complete word input as an enter press
            event.keyCode !== 229
          ) {
            selectItem(text);
          }
          if (event.key === "Backspace" && text.length === 0) {
            removeElement(props.selectedItems.length - 1, true);
            event.preventDefault();
          }
        },
        onBlur: (event) => {
          if (
            inputContainer.current !== null &&
            event.relatedTarget instanceof HTMLElement &&
            isNodeOrChildOfNode(inputContainer.current, event.relatedTarget)
          ) {
            inputElement.current?.focus();
            return;
          }
          if (
            (props.addCurrentTextOnBlur ?? true) &&
            // Checks if the user actually clicked off of the input or just switched windows
            document.activeElement !== event.currentTarget
          ) {
            selectItem(text);
          }
        },
        value: text,
        ref: (input) => {
          inputElement.current = input;
        },
      }}
      onSuggestionSelected={(event, { method, suggestionValue }) => {
        if (method === "click") {
          selectItem(suggestionValue);
        }
      }}
      renderInputComponent={(inputProps) => {
        return (
          <div
            ref={inputContainer}
            className="overflow-clip flex flex-row flex-wrap border-2 rounded-lg child-input-focused:default-input-outline w-full"
          >
            {props.selectedItems.map((item, index) => (
              <MultiSelectPill
                index={index}
                item={item}
                key={index}
                onDelete={() => {
                  removeElement(index);
                }}
              />
            ))}
            <input {...inputProps} />
          </div>
        );
      }}
      shouldKeepSuggestionsOnSelect={() => true}
      focusInputOnSuggestionClick={true}
      shouldRenderSuggestions={props.shouldRenderSuggestions}
      onSuggestionsFetchRequested={(request) => {
        if (request.reason === "suggestion-selected") {
          props.onSuggestionFetchRequested({
            ...request,
            value: "",
            addedItems: [request.value],
          });
        } else {
          props.onSuggestionFetchRequested(request);
        }
      }}
      onSuggestionsClearRequested={props.onSuggestionClearRequested}
      renderSuggestion={props.renderSuggestion}
      outerContainerProps={props.outerContainerProps}
      suggestionsContainerProps={props.suggestionContainerProps}
    />
  );
}
