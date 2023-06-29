import BufferAudioPlayer from "@/src/components/utils/BufferAudioPlayer";
import MultiSuggestionInput from "@/src/components/utils/MultiSuggestionInput";
import SuggestionInput from "@/src/components/utils/SuggestionInput";
import { FileContext } from "@/src/contexts/FileContext";
import { useAsyncLoad } from "@/src/hooks/use-async-load";
import { MyMusicLibrary } from "@/src/music/library/music-library";
import { Music } from "@/src/types/music";
import { Pages } from "@/src/types/pages";
import { pickSuggestions } from "@/src/utils/string-utils";
import { useContext, useState } from "react";

type MetadataEditorProps = {
  otherFiles?: Music.Files.EditableFile[];
  setFileMetadata: Pages.Upload.SetFileMetadataFunction;
};

export default function MetadataEditor(props: MetadataEditorProps) {
  const file = useContext(FileContext);
  const [genres, genresLoaded] = useAsyncLoad<string[]>(
    async () => {
      const genreList = await MyMusicLibrary.getGenreList();
      return genreList.map((result) => result.genre);
    },
    [],
    []
  );

  const [libraryArtists, libraryArtistsLoaded] = useAsyncLoad<string[]>(
    async () => {
      return (await MyMusicLibrary.getArtistList()).map(
        (result) => result.artist
      );
    },
    [],
    []
  );
  const [currentArtistText, setCurrentArtistText] = useState("");
  const [currentFeaturingText, setCurrentFeaturingText] = useState("");
  const [showDebugJson, setShowDebugJson] = useState(false);

  if (file) {
    const otherUploadGenres =
      props.otherFiles
        ?.filter(
          (f) =>
            f.metadata.genre !== undefined && f.metadata.id === file.metadata.id
        )
        .map((f) => f.metadata.genre ?? "") ?? [];

    const uniqueGenres = genres
      .concat(otherUploadGenres)
      .reduce<string[]>((arr, potentialGenre) => {
        if (!arr.includes(potentialGenre) && potentialGenre.trim() !== "") {
          arr.push(potentialGenre);
        }

        return arr;
      }, []);

    const otherUploadArtists =
      props.otherFiles
        ?.filter(
          (f) =>
            f.metadata.artists !== undefined &&
            f.metadata.id !== file.metadata.id
        )
        .map((f) => f.metadata.artists ?? [])
        .flat() ?? [];

    const uniqueArtists = libraryArtists
      .concat(otherUploadArtists)
      .reduce<string[]>((arr, potentialArtist) => {
        if (!arr.includes(potentialArtist) && potentialArtist.trim() !== "") {
          arr.push(potentialArtist);
        }

        return arr;
      }, []);
    file.metadata;
    return (
      <div className="gap-2 flex flex-col">
        <h3
          key={file.metadata.id + "-Title"}
          className="text-xl relative box-border"
        >
          <input
            className="peer w-full focus:opacity-100 bg-transparent opacity-0 outline-none p-2"
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
          <span className="whitespace-pre peer-focus:text-transparent inline absolute left-0 top-0 -z-10 outline  outline-gray-200 outline-2 box-border rounded-lg p-2">
            {file.metadata.title}
          </span>
        </h3>
        <BufferAudioPlayer
          key={file.metadata.id + "-AudioPlayer"}
          data={file.audioData.buffer}
        />
        <div className="flex flex-col">
          <label>Artists</label>
          <MultiSuggestionInput
            key={file.metadata.id + "-Artists"}
            selectedStrings={file.metadata.artists ?? []}
            onChange={setCurrentArtistText}
            suggestions={
              libraryArtistsLoaded
                ? pickSuggestions(
                    currentArtistText,
                    uniqueArtists.filter(
                      (artist) => !file.metadata.artists?.includes(artist)
                    ),
                    8
                  )
                : null
            }
            setSelectedStrings={(artists) => {
              props.setFileMetadata(file.metadata.id, "artists", artists);
            }}
            options={{
              placeholder: "Artists",
              widthClass: "max-w-fit",
            }}
          />
        </div>
        <div className="flex flex-col">
          <label>Featuring</label>
          <MultiSuggestionInput
            key={file.metadata.id + "-Featuring"}
            selectedStrings={file.metadata.featuring ?? []}
            onChange={setCurrentFeaturingText}
            suggestions={
              libraryArtistsLoaded
                ? pickSuggestions(
                    currentFeaturingText,
                    uniqueArtists.filter(
                      (artist) => !file.metadata.featuring?.includes(artist)
                    ),
                    8
                  )
                : null
            }
            setSelectedStrings={(featuring) => {
              props.setFileMetadata(file.metadata.id, "featuring", featuring);
            }}
            options={{
              placeholder: "Featuring",
              widthClass: "max-w-fit",
            }}
          />
        </div>
        <div className="flex flex-col">
          <label>Genre</label>
          <SuggestionInput
            key={file.metadata.id + "-Genre"}
            text={file.metadata.genre ?? ""}
            onChangeText={(genre) => {
              props.setFileMetadata(file.metadata.id, "genre", genre);
            }}
            suggestions={
              genresLoaded
                ? pickSuggestions(file.metadata.genre ?? "", uniqueGenres, 8)
                : null
            }
            options={{
              placeholder: "Genre",
              widthClass: "w-fit",
            }}
          />
        </div>
        <div>
          <button
            onClick={() => {
              setShowDebugJson(!showDebugJson);
            }}
            className="btn bg-gray-300 active:bg-gray-500"
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
                fileType: file.audioData.fileType,
                metadata: file.metadata,
              },
              null,
              2
            )}
          </p>
        </div>
      </div>
    );
  } else {
    return (
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        Click on a file to edit its metadata
      </div>
    );
  }
}
