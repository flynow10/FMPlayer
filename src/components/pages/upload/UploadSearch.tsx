import YoutubeSearch from "@/src/components/pages/upload/youtube-search/YoutubeSearch";
import FileDrop from "@/src/components/pages/upload/FileDrop";
import { Pages } from "@/src/types/pages";

type UploadSearchProps = {
  onNavigate: Pages.NavigationMethod;
  initialSearch?: string;
};

export default function UploadSearch(props: UploadSearchProps) {
  return (
    <div className="px-4 flex flex-row h-full">
      <div className="youtube-search w-3/5 border-r-2 h-full pr-3 flex flex-col">
        <h1 className="text-xl pt-4 pb-2">Find a song on Youtube</h1>
        <YoutubeSearch
          initialSearch={props.initialSearch}
          onClickDownload={(video) => {
            props.onNavigate("new", {
              type: "youtube upload",
              data: {
                video,
              },
            });
          }}
        />
      </div>
      <div className="grow flex flex-col gap-2 p-4">
        <h1 className="text-xl">Upload audio from your computer</h1>
        <FileDrop
          onReceiveFiles={(files) => {
            props.onNavigate("new", {
              type: "file upload",
              data: {
                uploadType: "file",
                files,
              },
            });
          }}
        />
      </div>
    </div>
  );
}
