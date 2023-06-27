import { FullCover } from "@/src/components/utils/loading-pages/FullCover";
import classNames from "classnames";
import { Search } from "lucide-react";
import { useRef, useState } from "react";

type SuggestionInputProps = {
  text: string;
  suggestions: string[] | null;
  onChangeText?: (newText: string) => void;
  onSearch?: (text: string) => void;
  options?: Partial<SuggestionInputOptions>;
};

type SuggestionInputOptions = {
  hasSearchButton: boolean;
  boldTypedInput: boolean;
};

export default function SuggestionInput(props: SuggestionInputProps) {
  const [inputFocused, setInputFocused] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const optionsWithDefaults: SuggestionInputOptions = {
    hasSearchButton: props.options?.hasSearchButton || false,
    boldTypedInput: props.options?.boldTypedInput || false,
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
          setSuggestionIndex(-1);
        }}
        onMouseDown={() => {
          props.onSearch?.(suggestion);
          props.onChangeText?.(suggestion);
          setInputFocused(false);
          setSuggestionIndex(-1);
        }}
        className={
          "flex flex-row py-1 hover:bg-gray-300" +
          (index === suggestionIndex ? " bg-gray-300" : "")
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
        inputRef.current?.blur();
        const currentValue =
          suggestionIndex !== -1 ? suggestions[suggestionIndex] : props.text;
        props.onSearch?.(currentValue);
        setSuggestionIndex(-1);

        if (currentValue !== props.text) {
          props.onChangeText?.(currentValue);
        }
      }}
      className="search-box w-full flex flex-row my-3"
    >
      <div className="grow relative">
        <input
          className="w-full p-2 border-y-2 border-l-2 rounded-l-lg outline-none focus-within:shadow-[0_0_3px_rgb(0,0,0,0.2)]"
          value={
            suggestionIndex !== -1 ? suggestions[suggestionIndex] : props.text
          }
          placeholder="Search by Keyword | Paste URL"
          onChange={(event) => {
            setSuggestionIndex(-1);
            props.onChangeText?.(event.currentTarget.value);
          }}
          onKeyDown={(event) => {
            switch (event.key) {
              case "ArrowDown": {
                event.preventDefault();
                let newIndex = suggestionIndex + 1;

                if (newIndex >= suggestions.length) {
                  newIndex = -1;
                }

                setSuggestionIndex(newIndex);
                break;
              }

              case "ArrowUp": {
                event.preventDefault();
                let newIndex = suggestionIndex - 1;

                if (newIndex <= -2) {
                  newIndex = suggestions.length - 1;
                }

                setSuggestionIndex(newIndex);
                break;
              }
            }
          }}
          onFocus={() => {
            setInputFocused(true);
          }}
          onBlur={() => {
            setInputFocused(false);
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
          {isLoading ? <FullCover /> : suggestionButtons}
        </div>
      </div>
      {optionsWithDefaults.hasSearchButton && (
        <button className="border-l-0 rounded-l-none btn success">
          Search
        </button>
      )}
    </form>
  );
}
