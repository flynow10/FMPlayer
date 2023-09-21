import Artwork from "@/src/components/media-displays/Artwork";
import { Music } from "@/src/types/music";
import classNames from "classnames";
import { Play } from "lucide-react";
import { MouseEvent } from "react";

type DisplayableMediaType = "album" | "track" | "playlist" | "artist";
type CardStyle = "cover-card" | "tab-card";

type MediaCardProps<T extends DisplayableMediaType> = {
  type: T;
  data: Music.DB.TableType<Capitalize<T>>;
  style: CardStyle;
  onClickPhoto?: (event: MouseEvent) => void | null;
  onClickTitle?: (event: MouseEvent) => void;
  onClickSubText?: (event: MouseEvent) => void;
};

export default function MediaCard<T extends DisplayableMediaType>(
  props: MediaCardProps<T>
) {
  let artworkId: string | null = null;
  let titleText = "";
  let subText = "";
  switch (props.type) {
    case "album": {
      const album = props.data as Music.DB.TableType<"Album">;
      artworkId = album.artwork?.id ?? null;
      titleText = album.title;
      subText = album.artists
        .map((artist) => artist.artist.name)
        .join(", ")
        .trim();
      break;
    }
    case "artist": {
      const artist = props.data as Music.DB.TableType<"Artist">;
      artworkId = null;
      titleText = artist.name;
      subText = "";
      break;
    }
    case "playlist": {
      const playlist = props.data as Music.DB.TableType<"Playlist">;
      artworkId = playlist.artwork?.id ?? null;
      titleText = playlist.title;
      subText = "";
      break;
    }
    case "track": {
      const track = props.data as Music.DB.TableType<"Track">;
      artworkId = track.artwork?.id ?? null;
      titleText = track.id;
      subText = track.artists
        .map((artist) => artist.artist.name)
        .join(", ")
        .trim();
      break;
    }
  }

  const playMedia = () => {
    // TODO: implement play media
    return;
  };

  const gotoMediaPage = () => {
    // TODO: implement page navigation
    return;
  };
  const visitable = ["album", "artist"].includes(props.type);
  const playable = ["album", "track"].includes(props.type);
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

  return (
    <div
      className={classNames("flex gap-3", {
        "flex-col w-52": props.style === "cover-card",
        "bg-gray-300 rounded-lg p-6 h-36": props.style === "tab-card",
      })}
    >
      {artwork}
      <div
        className={classNames("flex flex-col", {
          "my-auto w-48": props.style === "tab-card",
          "items-center":
            props.style === "cover-card" && props.type === "artist",
        })}
      >
        <a
          onClick={
            isTitleClickable ? props.onClickTitle ?? gotoMediaPage : undefined
          }
          className={classNames("line-clamp-2 text-sm w-fit", {
            "hover:underline cursor-pointer": isTitleClickable,
          })}
        >
          {titleText}
        </a>
        <a
          onClick={props.onClickSubText}
          className={classNames("text-gray-500 text-sm line-clamp-2", {
            "hover:underline cursor-pointer":
              props.onClickSubText !== undefined,
          })}
        >
          {subText}
        </a>
      </div>
    </div>
  );
}
