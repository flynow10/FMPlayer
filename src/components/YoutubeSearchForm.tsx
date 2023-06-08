import { YoutubeAPI } from "@/src/Youtube/YoutubeAPI";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function YoutubeSearchForm(props: {
  onSearch: (searchText: string) => any;
}) {
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [inputFocused, setInputFocused] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  const [hoveringButton, setHoveringButton] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    var active = true;
    (async () => {
      if (searchText === "") {
        setSuggestions([]);
      } else {
        const response = await YoutubeAPI.searchSuggestions(searchText);
        if (active) {
          setSuggestions(response.suggestions);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [searchText]);
  const showSuggestions = inputFocused && suggestions.length > 0;

  const suggestionButtons = suggestions.map((suggestion, index) => {
    const suggestionSplitBySearch = suggestion.split(
      new RegExp(`^${searchText}`)
    );
    var suggestionText;
    if (
      suggestionSplitBySearch.length === 2 &&
      suggestionSplitBySearch[0] === ""
    ) {
      suggestionText = (
        <span>
          <span>{searchText}</span>
          <span className="font-bold">{suggestionSplitBySearch[1]}</span>
        </span>
      );
    } else {
      const splitSearch = searchText.split(" ");
      const splitSuggestion = suggestion.split(" ");
      suggestionText = (
        <span>
          {splitSuggestion.map((word) => (
            <span className={splitSearch.includes(word) ? "" : "font-bold"}>
              {word}{" "}
            </span>
          ))}
        </span>
      );
    }
    return (
      <button
        key={index}
        type="button"
        onMouseOver={() => {
          setHoveringButton(true);
          setSuggestionIndex(-1);
        }}
        onMouseLeave={() => {
          setHoveringButton(false);
        }}
        onMouseDown={() => {
          props.onSearch(suggestion);
          setSearchText(suggestion);
          setInputFocused(false);
          setSuggestionIndex(-1);
        }}
        className={
          "flex flex-row py-1 hover:bg-gray-300" +
          (index === suggestionIndex ? " bg-gray-300" : "")
        }
      >
        <Search size={18} className="mr-2 my-auto" />
        {suggestionText}
      </button>
    );
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        inputRef.current?.blur();
        const currentValue =
          suggestionIndex !== -1 ? suggestions[suggestionIndex] : searchText;
        props.onSearch(currentValue);
        setSuggestionIndex(-1);
        if (currentValue !== searchText) {
          setSearchText(currentValue);
        }
      }}
      className="search-box w-full flex flex-row my-3"
    >
      <div className="grow relative">
        <input
          className="w-full p-2 border-y-2 border-l-2 rounded-l-lg outline-none focus-within:shadow-[0_0_3px_rgb(0,0,0,0.2)]"
          value={
            suggestionIndex !== -1 ? suggestions[suggestionIndex] : searchText
          }
          placeholder="Search by Keyword | Paste URL"
          onChange={(event) => {
            setSuggestionIndex(-1);
            setSearchText(event.currentTarget.value);
          }}
          onKeyDown={(event) => {
            switch (event.key) {
              case "ArrowDown": {
                event.preventDefault();
                var newIndex = suggestionIndex + 1;
                if (newIndex >= suggestions.length) {
                  newIndex = -1;
                }
                setSuggestionIndex(newIndex);
                break;
              }
              case "ArrowUp": {
                event.preventDefault();
                var newIndex = suggestionIndex - 1;
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
          className={
            "absolute bottom-0 p-2 translate-y-full w-full bg-white z-20 rounded-md overflow-hidden shadow-[0_0_3px_rgb(0,0,0,0.2)] flex flex-col" +
            (showSuggestions ? "" : " hidden")
          }
        >
          {suggestionButtons}
        </div>
      </div>
      <button className="border-y-2 border-r-2 p-2 border-emerald-500 bg-green-500 text-white rounded-r-lg active:bg-green-600">
        Search
      </button>
    </form>
  );
}
