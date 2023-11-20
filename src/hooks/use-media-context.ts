import { usePageContext } from "@/src/contexts/PageContext";
import { ShowContextMenuParams, useContextMenu } from "react-contexify";

export type ContextMenuTypes = "playlist" | "album" | "track";

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
}[T];

type MakeOptional<Type, Key extends keyof Type> = Omit<Type, Key> &
  Partial<Pick<Type, Key>>;

type MakeRequired<Type, Key extends keyof Type> = Type & {
  [P in Key]-?: Type[P];
};

export function useMediaContext<T extends ContextMenuTypes>(type: T) {
  const pages = usePageContext();
  return useContextMenu({
    id: `${type}-${pages.pageSlug}`,
  }) as {
    show: (
      params: MakeOptional<
        MakeRequired<ShowContextMenuParams<ContextMenuPropType<T>>, "props">,
        "id"
      >
    ) => void;
    hideAll: () => void;
  };
}
