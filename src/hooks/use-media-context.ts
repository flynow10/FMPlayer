import { usePageContext } from "@/src/contexts/PageContext";
import { Utils } from "@/src/types/utils";
import { ShowContextMenuParams, useContextMenu } from "react-contexify";

export type ContextMenuTypes = "playlist" | "album" | "track" | "function";

export type ContextMenuPropType<T extends ContextMenuTypes> = {
  playlist: {
    playlistId: string;
  };
  album: {
    albumId: string;
  };
  track: {
    trackId: string;
  };
  function: {
    functionId: string;
  };
}[T];

export function useMediaContext<T extends ContextMenuTypes>(type: T) {
  const pages = usePageContext();
  return useContextMenu({
    id: `${type}-${pages.pageSlug}`,
  }) as {
    show: (
      params: Utils.MakeOptional<
        Utils.MakeRequired<
          ShowContextMenuParams<ContextMenuPropType<T>>,
          "props"
        >,
        "id"
      >
    ) => void;
    hideAll: () => void;
  };
}
