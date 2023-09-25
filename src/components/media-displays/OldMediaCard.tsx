import { Play } from "lucide-react";
import { Music } from "@/src/types/music";
import { Pages } from "@/src/types/pages";
import Artwork from "@/src/components/media-displays/Artwork";

type MediaCardSize = "small" | "medium" | "large";

export type MediaCardProps = {
  id: string;
  title: string;
  mediaType: Music.MediaType;
  size?: MediaCardSize;
  onPlayMedia: Pages.PlayByID;
  onNavigate: Pages.NavigationMethod;
};

export function MediaCard(props: MediaCardProps) {
  const size = props.size || "small";

  if (size !== "small") {
    return (
      <div className={"flex flex-col" + (size === "large" ? " w-96" : " w-52")}>
        <button
          className="group relative rounded-lg overflow-hidden shadow-[0_3px_10px_rgb(0,0,0,0.2)]"
          onClick={() => {
            props.onPlayMedia(props.id, props.mediaType);
          }}
        >
          <Artwork
            id={props.id /* Needs to be replaced with artwork id */}
            className="group-hover:blur"
          />
          <Play
            size={48}
            className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        </button>
        <a
          className="mt-1 overflow-ellipsis break-words line-clamp-2 text-sm cursor-pointer hover:underline"
          onClick={() => {
            if (props.mediaType === "album") {
              props.onNavigate("new", {
                type: "album display",
                data: props.id,
              });
            }
          }}
        >
          {props.title}
        </a>
        <a></a>
      </div>
    );
  } else {
    return <span>Not Implemented</span>;
  }
}
