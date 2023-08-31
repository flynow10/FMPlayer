import BaseSuggestionInput from "@/src/components/utils/input-extensions/BaseSuggestionInput";
import MultiSuggestionInput from "@/src/components/utils/input-extensions/MultiSuggestionInput";
import { FileContext } from "@/src/contexts/FileContext";
import { useAsyncLoad } from "@/src/hooks/use-async-load";
import { MusicLibrary } from "@/src/music/library/music-library";
import { Pages } from "@/src/types/pages";
import { pickSuggestions } from "@/src/utils/string-utils";
import { useContext, useState } from "react";

type MetadataEditorProps = {
  setFileMetadata: Pages.Upload.SetFileMetadataFunction;
};

export default function MetadataEditor(props: MetadataEditorProps) {
  const file = useContext(FileContext);
  const [allArtists, allArtistsLoaded] = useAsyncLoad(
    () => {
      return MusicLibrary.db.artist.list();
    },
    [],
    []
  );
  const [libraryGenres, libraryGenresLoaded] = useAsyncLoad(
    () => {
      return MusicLibrary.db.genre.list();
    },
    [],
    []
  );
  const [artistsSuggestions, setArtistSuggestions] = useState<string[]>([]);
  const [featuringSuggestions, setFeaturingSuggestions] = useState<string[]>(
    []
  );
  const [genreSuggestions, setGenreSuggestions] = useState<string[]>([]);
  const [showDebugJson, setShowDebugJson] = useState(true);

  const filterArtistSuggestions = (
    search: string,
    newAddedArtists: string[] = []
  ): string[] => {
    if (!allArtistsLoaded) {
      return [];
    }
    return pickSuggestions(
      search,
      allArtists
        .map((a) => a.name)
        .filter(
          (a) =>
            !(
              file?.metadata.artists.includes(a) ||
              file?.metadata.featuring.includes(a) ||
              newAddedArtists.includes(a)
            )
        )
    );
  };
  const filterGenreSuggestions = (search: string) => {
    if (!libraryGenresLoaded) {
      return [];
    }
    return pickSuggestions(
      search,
      libraryGenres.map((g) => g.name)
    );
  };

  if (!file) {
    return (
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        Click on a file to edit its metadata
      </div>
    );
  }
  const commonSelectProps = {
    getSuggestionValue: (s: string) => s,
    renderSuggestion: (
      s: string,
      { isHighlighted }: { isHighlighted: boolean }
    ) => (
      <span
        className={
          "flex flex-row my-1 px-1" + (isHighlighted ? " bg-gray-400" : "")
        }
      >
        {s}
      </span>
    ),
    suggestionsContainerProps: {
      className: "border-2 rounded-lg p-2",
    },
  };
  return (
    <div className="gap-4 flex flex-col">
      <h3
        key={file.metadata.id + "-Title"}
        className="text-xl relative box-border"
      >
        <input
          className="relative z-10 peer w-full focus:opacity-100 bg-transparent opacity-0 outline-none p-2 max-w-full"
          defaultValue={file.metadata.title}
          placeholder={file.metadata.title}
          onChange={(e) => {
            props.setFileMetadata(
              file.metadata.id,
              "title",
              e.target.value || "Untitled Song"
            );
          }}
        />
        <span className="whitespace-pre peer-focus:text-transparent inline absolute left-0 top-0 outline max-w-full outline-gray-200 outline-2 box-border rounded-lg p-2 overflow-clip">
          {file.metadata.title}
        </span>
      </h3>
      <div className="flex flex-col">
        <label>Artists</label>
        <MultiSuggestionInput
          {...commonSelectProps}
          selectedItems={file.metadata.artists}
          suggestions={artistsSuggestions}
          setSelectedItems={(arg1) => {
            props.setFileMetadata(
              file.metadata.id,
              "artists",
              typeof arg1 === "function" ? arg1(file.metadata.artists) : arg1
            );
          }}
          onSuggestionFetchRequested={(request) => {
            setArtistSuggestions(
              filterArtistSuggestions(request.value, request.addedItems)
            );
          }}
          onSuggestionClearRequested={() => {
            setArtistSuggestions([]);
          }}
        />
      </div>
      <div className="flex flex-col">
        <label>Featuring</label>
        <MultiSuggestionInput
          {...commonSelectProps}
          selectedItems={file.metadata.featuring}
          onSuggestionFetchRequested={(request) => {
            setFeaturingSuggestions(
              filterArtistSuggestions(request.value, request.addedItems)
            );
          }}
          setSelectedItems={(arg1) => {
            props.setFileMetadata(
              file.metadata.id,
              "featuring",
              typeof arg1 === "function" ? arg1(file.metadata.featuring) : arg1
            );
          }}
          suggestions={featuringSuggestions}
          onSuggestionClearRequested={() => {
            setFeaturingSuggestions([]);
          }}
        />
      </div>
      <div className="flex flex-col">
        <label>Genre</label>
        <BaseSuggestionInput
          {...commonSelectProps}
          suggestions={genreSuggestions}
          inputProps={{
            className: "input w-full",
            onChange: (event, params) => {
              props.setFileMetadata(file.metadata.id, "genre", params.newValue);
            },
            value: file.metadata.genre,
          }}
          onSuggestionsFetchRequested={(request) => {
            setGenreSuggestions(filterGenreSuggestions(request.value));
          }}
          onSuggestionsClearRequested={() => {
            setGenreSuggestions([]);
          }}
        />
      </div>
      <div>
        <button
          onClick={() => {
            setShowDebugJson(!showDebugJson);
          }}
          className="btn text-black bg-gray-300 active:bg-gray-500"
        >
          Show Debug
        </button>

        <p
          className={
            "whitespace-pre-wrap " + (showDebugJson ? "block" : "hidden")
          }
        >
          {JSON.stringify(
            {
              metadata: file.metadata,
            },
            null,
            2
          )}
        </p>
      </div>
    </div>
  );
}
