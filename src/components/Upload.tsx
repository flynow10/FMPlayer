import YoutubeSearch from "./YoutubeSearch";

type UploadProps = {};

export default function Upload(props: UploadProps) {
  return (
    <div className="flex flex-row h-full">
      <div className="youtube-search w-2/3 border-r-2 h-full pr-3 flex flex-col">
        <h1 className="text-xl pt-4 pb-2">From Youtube</h1>
        <YoutubeSearch />
      </div>
      <div className="file-upload grow pl-3">
        <h1 className="text-xl pt-4 pb-2">From Computer</h1>
      </div>
    </div>
  );
}
