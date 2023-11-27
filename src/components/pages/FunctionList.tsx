import { FullCover } from "@/src/components/utils/loading/FullCover";
import { usePageContext } from "@/src/contexts/PageContext";
import { DataState, useDatabase } from "@/src/hooks/use-database";
import { MusicLibrary } from "@/src/music/library/music-library";

export default function PlaylistList() {
  const pages = usePageContext();
  const [functionList, loadedState] = useDatabase(
    () => {
      return MusicLibrary.db.function.list();
    },
    [],
    ["Function"]
  );

  if (loadedState === DataState.Loading) {
    return <FullCover />;
  }

  return (
    <div className="flex flex-col p-8 gap-4">
      <div className="flex flex-row">
        <span className="text-xl">Your functions</span>
        <button
          onClick={() => {
            pages.navigate("new", {
              type: "function editor",
              data: { isNew: true, id: null },
            });
          }}
          className="btn accent ml-auto"
        >
          New Function
        </button>
      </div>
      <div className="flex flex-row flex-wrap gap-8 overflow-auto">
        {functionList.length === 0 && (
          <span className="text">You have not created any functions</span>
        )}
        {functionList.map((functionData) => (
          <span key={functionData.id}>{functionData.title}</span>
        ))}
      </div>
    </div>
  );
}
