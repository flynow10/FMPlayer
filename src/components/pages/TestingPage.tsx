import { YoutubeAPI } from "@/src/api/youtube-API";
import SuggestionInput from "@/src/components/utils/SuggestionInput";
import BaseSuggestionInput from "@/src/components/utils/input-extensions/BaseSuggestionInput";
import { useAsyncLoad } from "@/src/hooks/use-async-load";
import { useState } from "react";

const loadSuggestions = async (text: string) => {
  return (await YoutubeAPI.searchSuggestions(text)).suggestions;
};

export default function TestingPage() {
  const [text, setText] = useState("");
  const [suggestions, , setSuggestions] = useAsyncLoad<string[]>(
    () => {
      return loadSuggestions(text);
    },
    [],
    []
  );

  return (
    <div className="flex flex-col gap-3 m-3 w-1/3">
      <div>
        <label>Old Version</label>
        <SuggestionInput
          onChangeText={async (newText) => {
            setText(newText);
            setSuggestions(await loadSuggestions(newText));
          }}
          text={text}
          suggestions={suggestions}
        />
      </div>
      <div>
        <label>New Version</label>
        <BaseSuggestionInput
          suggestions={suggestions}
          getSuggestionValue={(s) => s}
          inputProps={{
            value: text,
            className: "border-2",
            onChange: (_event, params) => {
              setText(params.newValue);
            },
          }}
          suggestionsContainerProps={{
            className: "border-2",
          }}
          onSuggestionsFetchRequested={async ({ value }) => {
            setSuggestions(await loadSuggestions(value));
          }}
          onSuggestionsClearRequested={() => {
            setSuggestions([]);
          }}
          renderSuggestion={(s) => s}
        />
      </div>
    </div>
  );
}
