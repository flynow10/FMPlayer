import classNames from "classnames";
import { Loader2, Search } from "lucide-react";
import { useRef, useState } from "react";

type SuggestionInputProps = {
  text: string;
  suggestions: string[] | null;
  onChangeText: (newText: string) => void;
  onSearch?: (text: string) => void;
  options?: Partial<SuggestionInputOptions>;
};

type SuggestionInputOptions = {
  hasSearchButton: boolean;
  boldTypedInput: boolean;
  placeholder: string;
  customInputClasses?: string;
  blurOnSubmit: boolean;
  widthClass: string;
};

export default function SuggestionInput(props: SuggestionInputProps) {
  const [inputFocused, setInputFocused] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  const [hasHoveredOverButton, setHasHoveredOverButton] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const optionsWithDefaults: SuggestionInputOptions = {
    hasSearchButton: props.options?.hasSearchButton ?? false,
    boldTypedInput: props.options?.boldTypedInput ?? false,
    placeholder: props.options?.placeholder ?? "",
    customInputClasses: props.options?.customInputClasses,
    blurOnSubmit: props.options?.blurOnSubmit ?? true,
    widthClass: props.options?.widthClass ?? "w-full",
  };
  const suggestions = props.suggestions || [];
  const isLoading = props.suggestions === null;
  const showDropdown = inputFocused && (suggestions.length > 0 || isLoading);

  const lowerCaseText = props.text.toLowerCase();
  const suggestionButtons = suggestions.map((suggestion, index) => {
    let suggestionJSX;

    if (!optionsWithDefaults.boldTypedInput) {
      suggestionJSX = <span>{suggestion}</span>;
    } else {
      const lowerCaseSuggestion = suggestion.toLowerCase();
      const suggestionSplitBySearch = lowerCaseSuggestion.split(lowerCaseText);

      if (
        suggestionSplitBySearch.length === 2 &&
        suggestionSplitBySearch[0] === "" &&
        lowerCaseSuggestion.indexOf(lowerCaseText) === 0
      ) {
        suggestionJSX = (
          <span>
            <span>{props.text}</span>
            <span className="font-bold">
              {suggestion.substring(lowerCaseText.length)}
            </span>
          </span>
        );
      } else {
        const splitSearch = lowerCaseText.split(" ");
        const splitSuggestion = suggestion.split(" ");
        suggestionJSX = (
          <span>
            {splitSuggestion.map((word) => (
              <span
                key={word}
                className={
                  splitSearch.includes(word.toLowerCase()) ? "" : "font-bold"
                }
              >
                {word}{" "}
              </span>
            ))}
          </span>
        );
      }
    }

    return (
      <button
        key={index}
        type="button"
        onMouseOver={() => {
          setHasHoveredOverButton(true);
        }}
        onMouseDown={() => {
          props.onChangeText?.(suggestion);
          props.onSearch?.(suggestion);
          setInputFocused(false);
          setSuggestionIndex(-1);
        }}
        className={
          "flex flex-row py-1 hover:bg-gray-300" +
          (index === suggestionIndex && !hasHoveredOverButton
            ? " bg-gray-300"
            : "")
        }
      >
        {optionsWithDefaults.hasSearchButton && (
          <Search size={18} className="mr-2 my-auto" />
        )}
        {suggestionJSX}
      </button>
    );
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        if (optionsWithDefaults.blurOnSubmit) {
          inputRef.current?.blur();
        }

        const currentValue =
          suggestionIndex !== -1 ? suggestions[suggestionIndex] : props.text;
        setSuggestionIndex(-1);

        if (currentValue !== props.text) {
          props.onChangeText?.(currentValue);
        }

        props.onSearch?.(currentValue);
      }}
      className={
        (optionsWithDefaults.customInputClasses === undefined
          ? optionsWithDefaults.widthClass
          : "") + " search-box grow flex flex-row relative"
      }
    >
      <input
        className={
          optionsWithDefaults.customInputClasses ??
          classNames(
            optionsWithDefaults.widthClass,
            "p-2",
            {
              "border-r-0": optionsWithDefaults.hasSearchButton,
              "rounded-r-none": optionsWithDefaults.hasSearchButton,
            },
            "border-2",
            "rounded-lg",
            "outline-none",
            "focus-within:shadow-[0_0_3px_rgb(0,0,0,0.2)]"
          )
        }
        value={
          suggestionIndex !== -1 ? suggestions[suggestionIndex] : props.text
        }
        placeholder={optionsWithDefaults.placeholder}
        onChange={(event) => {
          setSuggestionIndex(-1);
          props.onChangeText?.(event.currentTarget.value);
        }}
        onKeyDown={(event) => {
          switch (event.key) {
            case "ArrowDown": {
              event.preventDefault();
              let newIndex = (hasHoveredOverButton ? -1 : suggestionIndex) + 1;

              if (newIndex >= suggestions.length) {
                newIndex = -1;
              }

              setSuggestionIndex(newIndex);
              break;
            }

            case "ArrowUp": {
              event.preventDefault();
              let newIndex = (hasHoveredOverButton ? -1 : suggestionIndex) - 1;

              if (newIndex <= -2) {
                newIndex = suggestions.length - 1;
              }

              setSuggestionIndex(newIndex);
              break;
            }
          }

          setHasHoveredOverButton(false);
        }}
        onFocus={() => {
          setInputFocused(true);
        }}
        onBlur={(e) => {
          setInputFocused(false);
          setHasHoveredOverButton(false);
          setSuggestionIndex(-1);
          props.onChangeText?.(e.target.value);
        }}
        ref={inputRef}
      />
      <div
        className={classNames(
          {
            hidden: !showDropdown,
            "h-10": isLoading,
          },
          "absolute",
          "bottom-0",
          "p-2",
          "translate-y-full",
          "w-full",
          "bg-white",
          "z-20",
          "rounded-md",
          "overflow-hidden",
          "shadow-[0_0_3px_rgb(0,0,0,0.2)]",
          "flex",
          "flex-col"
        )}
      >
        {isLoading ? (
          <div>
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          suggestionButtons
        )}
      </div>
      {optionsWithDefaults.hasSearchButton && (
        <button className="border-l-0 rounded-l-none btn success">
          Search
        </button>
      )}
    </form>
  );
}
