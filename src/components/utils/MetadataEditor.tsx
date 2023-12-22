import { useContext, useState } from "react";

import BaseSuggestionInput from "@/src/components/utils/input-extensions/BaseSuggestionInput";
import MultiSuggestionInput from "@/src/components/utils/input-extensions/MultiSuggestionInput";

import { getApplicationDebugConfig } from "@/config/app";
import { FileContext } from "@/src/contexts/FileContext";
import { DataState, useDatabase } from "@/src/hooks/use-database";
import { MusicLibrary } from "@/src/music/library/music-library";
import { Music } from "@/src/types/music";
import { Pages } from "@/src/types/pages";
import { pickSuggestions } from "@/src/utils/string-utils";

type MetadataEditorProps = {
  setFileMetadata: Pages.Upload.SetFileMetadataFunction;
};

export default function MetadataEditor(props: MetadataEditorProps) {
  const file = useContext(FileContext);
  const debugConfig = getApplicationDebugConfig();
  const [allArtists, allArtistsLoaded] = useDatabase(
    () => {
      return MusicLibrary.db.artist.list();
    },
    [],
    ["Artist"]
  );
  const [libraryGenres, libraryGenresLoaded] = useDatabase(
    () => {
      return MusicLibrary.db.genre.list();
    },
    [],
    ["Genre"]
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
    if (allArtistsLoaded === DataState.Loading) {
      return [];
    }
    return pickSuggestions(
      search,
      allArtists
        .map((a) => a.name)
        .filter(
          (a) =>
            !(
              file?.artists.map((b) => b.name).includes(a) ||
              newAddedArtists.includes(a)
            )
        )
    );
  };
  const filterGenreSuggestions = (search: string) => {
    if (libraryGenresLoaded === DataState.Loading) {
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
      <h3 key={file.id + "-Title"} className="text-xl relative box-border">
        <input
          className="relative z-10 peer w-full focus:opacity-100 bg-transparent opacity-0 outline-none p-2 max-w-full"
          defaultValue={file.title}
          placeholder={file.title}
          onChange={(e) => {
            props.setFileMetadata(
              file.id,
              "title",
              e.target.value || "Untitled Song"
            );
          }}
        />
        <span className="whitespace-pre peer-focus:text-transparent inline absolute left-0 top-0 outline max-w-full outline-gray-200 outline-2 box-border rounded-lg p-2 overflow-clip">
          {file.title}
        </span>
      </h3>
      <div className="flex flex-col">
        <label>Artists</label>
        <MultiSuggestionInput
          {...commonSelectProps}
          selectedItems={file.artists
            .filter((a) => a.type === "MAIN")
            .map((a) => a.name)}
          suggestions={artistsSuggestions}
          setSelectedItems={(arg1) => {
            const mainArtists: Music.Files.NewTrackMetadata["artists"] = (
              typeof arg1 === "function"
                ? arg1(
                    file.artists
                      .filter((a) => a.type === "MAIN")
                      .map((a) => a.name)
                  )
                : arg1
            ).map((a) => ({ name: a, type: "MAIN" }));
            props.setFileMetadata(file.id, "artists", [
              ...mainArtists,
              ...file.artists.filter((a) => a.type === "FEATURED"),
            ]);
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
          selectedItems={file.artists
            .filter((a) => a.type === "FEATURED")
            .map((a) => a.name)}
          onSuggestionFetchRequested={(request) => {
            setFeaturingSuggestions(
              filterArtistSuggestions(request.value, request.addedItems)
            );
          }}
          setSelectedItems={(arg1) => {
            const featuredArtists: Music.Files.NewTrackMetadata["artists"] = (
              typeof arg1 === "function"
                ? arg1(
                    file.artists
                      .filter((a) => a.type === "FEATURED")
                      .map((a) => a.name)
                  )
                : arg1
            ).map((a) => ({ name: a, type: "FEATURED" }));
            props.setFileMetadata(file.id, "artists", [
              ...file.artists.filter((a) => a.type === "MAIN"),
              ...featuredArtists,
            ]);
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
              props.setFileMetadata(file.id, "genre", params.newValue);
            },
            value: file.genre,
          }}
          onSuggestionsFetchRequested={(request) => {
            setGenreSuggestions(filterGenreSuggestions(request.value));
          }}
          onSuggestionsClearRequested={() => {
            setGenreSuggestions([]);
          }}
        />
      </div>
      {debugConfig?.showRawUploadData && (
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
                metadata: file,
              },
              null,
              2
            )}
          </p>
        </div>
      )}
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
              metadata: file,
            },
            null,
            2
          )}
        </p>
      </div>
    </div>
  );
}
