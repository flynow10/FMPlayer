import {
  NavigationMethod,
  NavigationType,
  PlayByID,
} from "@/src/components/layout/Main";
import { Play } from "lucide-react";
import { PageType } from "@/src/components/layout/Page";
import { MediaType } from "@/src/utils/types";
import placeholder from "@/src/assets/imgs/square-placeholder.jpg";

export type MediaCardProps = {
  id: string;
  title: string;
  mediaType: MediaType;
  size?: MediaCardSize;
  onPlayMedia: PlayByID;
  onNavigate: NavigationMethod;
};

export enum MediaCardSize {
  Small,
  Medium,
  Large,
}

export function MediaCard(props: MediaCardProps) {
  const size = props.size || MediaCardSize.Small;
  if (size !== MediaCardSize.Small) {
    return (
      <div
        className={
          "flex flex-col" + (size === MediaCardSize.Large ? " w-96" : " w-52")
        }
        role="button"
      >
        <div
          className="group relative aspect-square overflow-hidden shadow-[0_3px_10px_rgb(0,0,0,0.2)] rounded-2xl"
          onClick={() => {
            props.onPlayMedia(props.id, props.mediaType);
          }}
        >
          <img
            src={/* album.coverUrl ? album.coverUrl :  */ placeholder}
            className="w-full h-full group-hover:blur transition-[filter]"
          />
          <Play
            size={48}
            className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        </div>
        <a
          className="h-12 mt-1 overflow-ellipsis overflow-clip break-words hover:underline"
          role="link"
          onClick={() => {
            props.onNavigate(NavigationType.New, {
              type: PageType.AlbumDisplay,
              data: props.id,
            });
          }}
        >
          {props.title}
        </a>
      </div>
    );
  } else {
    return <span>Not Implemented</span>;
  }
}
