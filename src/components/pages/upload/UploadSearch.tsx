import { useState } from "react";
import YoutubeSearch from "@/src/components/pages/upload/youtube-search/YoutubeSearch";
import { isUrl, isYoutubeUrl } from "@/src/utils/url-utils";
import FileDrop from "@/src/components/pages/upload/FileDrop";
import { Pages } from "@/src/types/pages";

type UploadSearchProps = {
  onNavigate: Pages.NavigationMethod;
};

export default function UploadSearch(props: UploadSearchProps) {
  const [urlText, setUrlText] = useState("");
  const [isTextYoutubeUrl, setIsTextYoutubeUrl] = useState(false);
  return (
    <div className="px-4 flex flex-row h-full">
      <div className="youtube-search w-2/3 border-r-2 h-full pr-3 flex flex-col">
        <h1 className="text-xl pt-4 pb-2">From Youtube</h1>
        <YoutubeSearch
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
      <div className="file-upload grow pl-3 flex flex-col">
        <div className="grow flex flex-col">
          <h1 className="text-xl pt-4 pb-2 border-b-2">From Computer</h1>
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
        <div>
          <h1 className="text-xl pt-4 pb-2">From URL</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="search-box w-full flex flex-row my-3 relative"
          >
            <input
              className="w-full p-2 border-y-2 border-l-2 rounded-l-lg outline-none focus-within:shadow-[0_0_3px_rgb(0,0,0,0.2)]"
              placeholder="Paste URL"
              onChange={(event) => {
                const inputValue = event.currentTarget.value;
                setUrlText(inputValue);
                isYoutubeUrl(inputValue).then((videoId) => {
                  setIsTextYoutubeUrl(videoId !== false);
                });
              }}
            />
            <div
              className={
                "absolute top-0 left-0 text-white border-2 border-red-500 -translate-y-full bg-red-400 p-2 rounded-md" +
                (!isTextYoutubeUrl ? " hidden" : "")
              }
            >
              Use youtube search to the left
            </div>
            <button
              className="border-l-0 rounded-l-none btn success"
              disabled={!isUrl(urlText) || isTextYoutubeUrl}
              onClick={() => {
                props.onNavigate("new", {
                  type: "file upload",
                  data: {
                    uploadType: "url",
                    url: urlText,
                  },
                });
              }}
            >
              Upload
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
