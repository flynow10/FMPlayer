import BaseSuggestionInput from "@/src/components/utils/input-extensions/BaseSuggestionInput";
import { InputExtensions } from "@/src/types/input-extensions";
import { boldPartialSearchCompletion } from "@/src/utils/string-utils";
import classNames from "classnames";
import { Search } from "lucide-react";
import { ButtonHTMLAttributes, HTMLAttributes, useRef, useState } from "react";

type SuggestionSearchProps<S> = {
  completions: S[];
  onSubmit: InputExtensions.Search.SubmitSearch<S>;
  getCompletionValue: InputExtensions.GetSuggestionValue<S>;
  onCompletionClearRequested?: () => void;
  onCompletionFetchRequested: InputExtensions.SuggestionsFetchRequested;
  outerContainerProps?: HTMLAttributes<HTMLDivElement>;
  inputProps?: InputExtensions.Search.InputProps<S>;
  searchButtonProps?: InputExtensions.Search.SearchButtonProps;
  suggestionContainerProps?: HTMLAttributes<HTMLUListElement>;
  onChange?: InputExtensions.ChangeEventHandler;
};

export default function SuggestionSearch<S>(props: SuggestionSearchProps<S>) {
  const [search, setSearchText] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { buttonText, ...buttonAttributes } = props.searchButtonProps ?? {};
  const buttonProps: ButtonHTMLAttributes<HTMLButtonElement> = {
    className: "btn success border-l-0 rounded-l-none",
    ...buttonAttributes,
    onClick: (event) => {
      props.onSubmit(search);
      buttonAttributes.onClick?.(event);
    },
  };
  return (
    <BaseSuggestionInput
      suggestions={props.completions}
      getSuggestionValue={props.getCompletionValue}
      inputProps={{
        className: "input rounded-r-none border-r-0 w-full",
        placeholder: "Search",
        ...props.inputProps,
        onChange: (event, params) => {
          props.onChange?.(event, params);
          setSearchText(params.newValue);
        },
        value: search,
        onKeyDown: (event) => {
          if (event.key === "Enter" && event.keyCode !== 229) {
            props.onSubmit(search);
            inputRef.current?.blur();
          }
          props.inputProps?.onKeyDown?.(event);
        },
        ref: (inputElement) => {
          inputRef.current = inputElement;
        },
      }}
      suggestionsContainerProps={{
        className: "px-2 py-1 border-2 rounded-lg",
        ...props.suggestionContainerProps,
      }}
      onSuggestionSelected={(
        event,
        { method, suggestion, suggestionValue }
      ) => {
        if (method === "click") {
          props.onSubmit(suggestionValue, suggestion);
        }
      }}
      onSuggestionsFetchRequested={props.onCompletionFetchRequested}
      renderInputComponent={(inputProps) => {
        return (
          <div className="flex flex-row">
            <input {...inputProps} />
            <button {...buttonProps}>
              {buttonText === undefined
                ? "Search"
                : typeof buttonText === "function"
                ? buttonText(search)
                : buttonText}
            </button>
          </div>
        );
      }}
      renderSuggestion={(suggestion, { isHighlighted, query }) => {
        const suggestionValue = props.getCompletionValue(suggestion);
        const suggestionClass = classNames(
          "flex",
          "flex-row",
          "gap-2",
          "my-1",
          "p-1",
          {
            "bg-gray-300": isHighlighted,
          }
        );
        return (
          <span className={suggestionClass}>
            <Search />
            <span>
              {boldPartialSearchCompletion(query, suggestionValue).map(
                ({ text, bold }, index) => (
                  <span key={index} className={bold ? "font-bold" : ""}>
                    {text}
                  </span>
                )
              )}
            </span>
          </span>
        );
      }}
      outerContainerProps={props.outerContainerProps}
      onSuggestionsClearRequested={props.onCompletionClearRequested}
    />
  );
}
