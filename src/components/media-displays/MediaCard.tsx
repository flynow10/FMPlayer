import { ReactNode } from "react";

import Artwork from "@/src/components/media-displays/Artwork";
import LinkedArtistList from "@/src/components/media-displays/LinkedArtistList";

import { getApplicationDebugConfig } from "@/config/app";
import { usePageContext } from "@/src/contexts/PageContext";
import { useAudioPlayer } from "@/src/hooks/use-audio-player";
import { useMediaContext } from "@/src/hooks/use-media-context";
import { Music } from "@/src/types/music";
import { Pages } from "@/src/types/pages";

import classNames from "classnames";
import { Play } from "lucide-react";

export default function MediaCard<
  T extends Pages.MediaDisplay.DisplayableMediaType
>(props: Pages.MediaDisplay.MediaCardProps<T>) {
  const debugConfig = getApplicationDebugConfig();
  const pages = usePageContext();
  const audioPlayer = useAudioPlayer();
  const { show: showPlaylistMenu } = useMediaContext("playlist");
  const { show: showAlbumMenu } = useMediaContext("album");
  const { show: showTrackMenu } = useMediaContext("track");
  const { show: showFunctionMenu } = useMediaContext("function");
  let artworkId: string | null = null;
  let titleText = "";
  let subText: string | ReactNode = "";
  switch (props.type) {
    case "album": {
      const album = props.data as Pages.MediaDisplay.LimitedTableType["album"];
      artworkId = album.artwork?.id ?? null;
      titleText = album.title;
      if (album.artists.length > 0) {
        subText = (
          <LinkedArtistList
            artistList={album.artists}
            onClickArtist={(artistId) => {
              pages.navigate("new", { type: "artist list", data: artistId });
            }}
          />
        );
      }
      break;
    }
    case "artist": {
      const artist =
        props.data as Pages.MediaDisplay.LimitedTableType["artist"];
      artworkId = null;
      titleText = artist.name;
      subText = "";
      break;
    }
    case "playlist": {
      const playlist =
        props.data as Pages.MediaDisplay.LimitedTableType["playlist"];
      artworkId = playlist.artwork?.id ?? null;
      titleText = playlist.title;
      subText = "";
      break;
    }
    case "track": {
      const track = props.data as Pages.MediaDisplay.LimitedTableType["track"];
      artworkId = track.artwork?.id ?? null;
      titleText = track.title;
      if (track.artists.length > 0) {
        subText = (
          <LinkedArtistList
            artistList={track.artists}
            onClickArtist={(artistId) => {
              pages.navigate("new", { type: "artist list", data: artistId });
            }}
          />
        );
      }
      break;
    }
    case "function": {
      const functionData =
        props.data as Pages.MediaDisplay.LimitedTableType["function"];
      artworkId = functionData.artwork?.id ?? null;
      titleText = functionData.title;
      subText = "";
    }
  }

  if (debugConfig?.showIds) {
    subText = props.data.id;
  }

  const playMedia = () => {
    switch (props.type) {
      case "album": {
        audioPlayer.play.album(props.data.id);
        break;
      }
      case "track": {
        audioPlayer.play.track(props.data.id);
        break;
      }
      case "playlist": {
        const playlist = props.data as Music.DB.TableType<"Playlist">;
        audioPlayer.play.trackList(playlist.trackListId);
        break;
      }
      case "function": {
        audioPlayer.play.func(props.data.id);
        break;
      }
      default: {
        alert("Unable to play this type of media!");
        break;
      }
    }
  };

  const visitable = ["album", "artist", "playlist", "function"].includes(
    props.type
  );
  const gotoMediaPage = () => {
    let pageType: Pages.PageType | null = null;
    switch (props.type) {
      case "album": {
        pageType = "album display";
        break;
      }
      case "artist": {
        pageType = "artist list";
        break;
      }
      case "playlist": {
        pageType = "playlist display";
        break;
      }
      case "function": {
        pageType = "function display";
      }
    }
    if (pageType === null) {
      throw new Error("Cannot navigate to unvisitable page");
    }
    pages.navigate("new", {
      type: pageType,
      data: props.data.id,
    });
    return;
  };
  const playable = ["album", "track", "playlist", "function"].includes(
    props.type
  );
  const clickablePhoto = props.onClickPhoto !== null;

  const ArtworkWrapper = clickablePhoto ? "button" : "div";
  const artwork = (
    <ArtworkWrapper
      className={classNames(
        "relative",
        "aspect-square",
        "group",
        "overflow-hidden",
        "rounded-lg"
      )}
      onClick={
        clickablePhoto
          ? props.onClickPhoto ??
            (playable ? playMedia : visitable ? gotoMediaPage : undefined)
          : undefined
      }
    >
      <Artwork
        id={artworkId}
        rounded={props.type !== "artist"}
        className={classNames({
          "rounded-full": props.type === "artist",
        })}
        imgClassName={classNames({
          "group-hover:blur-sm": clickablePhoto,
        })}
      />
      {playable && clickablePhoto && (
        <Play
          size={48}
          className="group-hover:block hidden left-1/2 top-1/2 absolute -translate-x-1/2 -translate-y-1/2"
        />
      )}
    </ArtworkWrapper>
  );

  const isTitleClickable =
    props.onClickTitle !== null &&
    (props.onClickTitle !== undefined || visitable);

  const shouldDisplayType =
    props.shouldDisplayType && props.style === "tab-card";

  const SubTextElement = props.onClickSubText === undefined ? "span" : "a";

  const textLinks = (
    <div
      className={classNames("flex flex-col overflow-hidden", {
        "my-auto w-48": props.style === "tab-card",
        "items-center": props.style === "cover-card" && props.type === "artist",
      })}
    >
      <a
        onClick={
          isTitleClickable
            ? props.onClickTitle ?? (visitable ? gotoMediaPage : undefined)
            : undefined
        }
        className={classNames("line-clamp-2 text-sm w-fit whitespace-normal", {
          "hover:underline cursor-pointer": isTitleClickable,
        })}
      >
        {titleText}
      </a>
      <SubTextElement
        onClick={props.onClickSubText}
        className={classNames(
          "text-gray-500 text-sm line-clamp-2 w-fit whitespace-normal break-words",
          {
            "hover:underline cursor-pointer":
              props.onClickSubText !== undefined,
          }
        )}
      >
        {shouldDisplayType &&
          props.type[0].toUpperCase() +
            props.type.substring(1) +
            (subText !== "" ? " • " : "")}
        {subText}
      </SubTextElement>
    </div>
  );

  return (
    <div
      onContextMenu={(event) => {
        switch (props.type) {
          case "playlist": {
            showPlaylistMenu({
              event,
              props: {
                playlistId: props.data.id,
              },
            });
            break;
          }
          case "album": {
            showAlbumMenu({
              event,
              props: {
                albumId: props.data.id,
              },
            });
            break;
          }
          case "track": {
            showTrackMenu({
              event,
              props: {
                trackId: props.data.id,
              },
            });
            break;
          }
          case "function": {
            showFunctionMenu({
              event,
              props: {
                functionId: props.data.id,
              },
            });
            break;
          }
        }
      }}
      className={classNames("flex gap-3 shrink-0", {
        "flex-col w-52": props.style === "cover-card",
        "bg-gray-300 rounded-lg p-6 h-36": props.style === "tab-card",
      })}
    >
      {artwork}
      {!props.hideLinks && textLinks}
    </div>
  );
}
