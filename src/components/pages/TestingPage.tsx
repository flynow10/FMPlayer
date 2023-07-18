import OldMultiSuggestionInput from "@/src/components/utils/MultiSuggestionInput";
import MultiSuggestionInput from "@/src/components/utils/input-extensions/MultiSuggestionInput";
import { pickSuggestions } from "@/src/utils/string-utils";
import { useState } from "react";

const options = [
  "Acoustic",
  "Anime",
  "Classical",
  "EDM",
  "Heavy Metal",
  "Hip Hop",
  "Mashup",
  "Metal",
  "Movie",
  "Nightcore",
  "Orchestral",
  "Rock",
  "TV Show",
  "Video Game",
];

export default function TestingPage() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const reloadSuggestions = (value: string, newItems: string[]) => {
    console.log(newItems);
    setSuggestions(
      pickSuggestions(
        value,
        options.filter(
          (s) => !newItems.includes(s) && !selectedItems.includes(s)
        )
      )
    );
  };
  return (
    <div className="flex flex-col gap-3 m-3 w-1/3">
      <div>
        <label>Old Version</label>
        <OldMultiSuggestionInput
          selectedStrings={selectedItems}
          setSelectedStrings={setSelectedItems}
          suggestions={suggestions}
          onChange={(text) => {
            reloadSuggestions(text, selectedItems);
          }}
        />
      </div>
      <pre>{JSON.stringify(selectedItems)}</pre>
      <div>
        <label>New Version</label>
        <MultiSuggestionInput
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          suggestions={suggestions}
          getSuggestionValue={(s) => s}
          renderSuggestion={(s, { isHighlighted }) => (
            <span
              className={
                "flex flex-row my-1 px-1" +
                (isHighlighted ? " bg-gray-400" : "")
              }
            >
              {s}
            </span>
          )}
          suggestionsContainerProps={{
            className: "border-2 rounded-lg p-2",
          }}
          onSuggestionFetchRequested={(params) => {
            reloadSuggestions(params.value, params.addedItems ?? []);
          }}
          onSuggestionClearRequested={() => {
            setSuggestions([]);
          }}
          shouldRenderSuggestions={() => true}
        />
      </div>
    </div>
  );
}
