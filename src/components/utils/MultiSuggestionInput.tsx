import SuggestionInput from "@/src/components/utils/SuggestionInput";
import { X } from "lucide-react";
import { useState } from "react";

type MultiSuggestionInputProps = {
  selectedStrings: string[];
  suggestions: string[] | null;
  onChange?: (value: string) => void;
  setSelectedStrings: (values: string[]) => void;
  options?: Partial<MultiSuggestionInputOptions>;
};

type MultiSuggestionInputOptions = {
  placeholder: string;
  widthClass: string;
};

export default function MultiSuggestionInput(props: MultiSuggestionInputProps) {
  const [currentText, _setCurrentText] = useState("");

  const optionsWithDefaults: MultiSuggestionInputOptions = {
    placeholder: props.options?.placeholder ?? "",
    widthClass: props.options?.widthClass ?? "w-full",
  };

  function setCurrentText(value: string) {
    _setCurrentText(value);
    props.onChange?.(value);
  }

  return (
    <div
      onKeyDown={(e) => {
        if (e.key === "Backspace" || e.key === "Delete") {
          if (e.target instanceof HTMLInputElement) {
            if (currentText === "") {
              e.preventDefault();

              if (props.selectedStrings.length > 0) {
                setCurrentText(
                  props.selectedStrings[props.selectedStrings.length - 1]
                );
              }

              props.setSelectedStrings(props.selectedStrings.slice(0, -1));
            }
          }
        }
      }}
      className={
        "flex flex-wrap rounded-lg border-2 p-1 gap-2 pl-2 " +
        optionsWithDefaults.widthClass
      }
    >
      {props.selectedStrings.map((artist) => {
        const deleteArtist = () => {
          props.setSelectedStrings(
            props.selectedStrings.filter((a) => a !== artist)
          );
        };

        return (
          <div
            key={artist}
            className="focus:outline outline-1 shrink-0 flex rounded bg-gray-300 p-1 -ml-1"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Backspace" || e.key === "Delete") {
                deleteArtist();
              }
            }}
          >
            <span>{artist}</span>
            <button
              className="hover:text-red-500 transition-colors"
              tabIndex={-1}
              onClick={() => {
                deleteArtist();
              }}
            >
              <X className="h-fit p-1" />
            </button>
          </div>
        );
      })}
      <SuggestionInput
        text={currentText}
        onChangeText={setCurrentText}
        suggestions={props.suggestions}
        onSearch={(text) => {
          if (!props.selectedStrings.includes(text) && text.trim() !== "") {
            setCurrentText("");
            props.setSelectedStrings([...props.selectedStrings, text]);
          }
        }}
        options={{
          placeholder: optionsWithDefaults.placeholder,
          customInputClasses: "outline-none grow py-1",
          blurOnSubmit: false,
        }}
      />
    </div>
  );
}
