import { PreUploadSong } from "@/src/components/pages/upload/FileUpload";
import MultiSuggestionInput from "@/src/components/utils/MultiSuggestionInput";
import SuggestionInput from "@/src/components/utils/SuggestionInput";
import { useAsyncLoad } from "@/src/hooks/use-async-load";
import { MyMusicLibrary } from "@/src/music/library/music-library";
import { Upload } from "@/src/types/upload";
import { pickSuggestions } from "@/src/utils/string-utils";
import { useState } from "react";

type MetadataEditorProps = {
  files: PreUploadSong[];
  currentFileId: string;
  setFileMetadata: Upload.SetFileMetadataFunction;
};

export default function MetadataEditor(props: MetadataEditorProps) {
  const file = props.files.find((f) => f.tempId === props.currentFileId);
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

  if (file) {
    const otherUploadGenres = props.files
      .filter(
        (f) =>
          f.metadata.genre !== undefined && f.tempId !== props.currentFileId
      )
      .map((f) => f.metadata.genre ?? "");

    const uniqueGenres = genres
      .concat(otherUploadGenres)
      .reduce<string[]>((arr, potentialGenre) => {
        if (!arr.includes(potentialGenre) && potentialGenre.trim() !== "") {
          arr.push(potentialGenre);
        }

        return arr;
      }, []);

    const otherUploadArtists = props.files
      .filter(
        (f) =>
          f.metadata.artists !== undefined && f.tempId !== props.currentFileId
      )
      .map((f) => f.metadata.artists ?? [])
      .flat();

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
      <>
        <div className="flex flex-col">
          <label htmlFor="artists">Artists</label>
          <MultiSuggestionInput
            key={file.tempId + "-Artists"}
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
              props.setFileMetadata(file.tempId, "artists", artists);
            }}
            options={{
              placeholder: "Artists",
              widthClass: "max-w-fit",
            }}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="featuring">Featuring</label>
          <MultiSuggestionInput
            key={file.tempId + "-Featuring"}
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
              props.setFileMetadata(file.tempId, "featuring", featuring);
            }}
            options={{
              placeholder: "Featuring",
              widthClass: "max-w-fit",
            }}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="genre">Genre</label>
          <SuggestionInput
            key={file.tempId + "-Genre"}
            text={file.metadata.genre ?? ""}
            onChangeText={(genre) => {
              props.setFileMetadata(file.tempId, "genre", genre);
            }}
            suggestions={
              genresLoaded
                ? pickSuggestions(file.metadata.genre ?? "", uniqueGenres, 8)
                : null
            }
            options={{
              placeholder: "Genre",
              widthClass: "max-w-fit",
            }}
          />
        </div>
      </>
    );
  } else {
    return <></>;
  }
}
