import { useState } from "react";
import YoutubeSearch from "./YoutubeSearch";
import { isUrl, isYoutubeUrl } from "@/src/Youtube/urlUtils";
import FileDrop from "./FileDrop";

type UploadProps = {};

export default function Upload(props: UploadProps) {
  const [isTextUrl, setIsTextUrl] = useState(false);
  const [isTextYoutubeUrl, setIsTextYoutubeUrl] = useState(false);
  return (
    <div className="flex flex-row h-full">
      <div className="youtube-search w-2/3 border-r-2 h-full pr-3 flex flex-col">
        <h1 className="text-xl pt-4 pb-2">From Youtube</h1>
        <YoutubeSearch
          onClickDownload={(videoId) => {
            alert("Downloading " + videoId);
          }}
        />
      </div>
      <div className="file-upload grow pl-3 flex flex-col">
        <div className="grow flex flex-col">
          <h1 className="text-xl pt-4 pb-2 border-b-2">From Computer</h1>
          <FileDrop />
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
                setIsTextUrl(isUrl(inputValue));
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
              className="border-y-2 border-r-2 p-2 disabled:border-gray-500 border-emerald-500 disabled:bg-gray-500 bg-green-500 text-white rounded-r-lg active:bg-green-600"
              disabled={!isTextUrl || isTextYoutubeUrl}
            >
              Upload
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
