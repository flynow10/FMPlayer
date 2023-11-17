import { YoutubeAPI } from "@/src/api/youtube-API";
import { FullCover } from "@/src/components/utils/loading/FullCover";
import { useAsyncLoad } from "@/src/hooks/use-async-load";
import { shortenNumberString } from "@/src/utils/string-utils";

type ChannelDisplayProps = {
  channelId: string;
};

export default function ChannelDisplay(props: ChannelDisplayProps) {
  const [channel, loadedChannel] = useAsyncLoad(
    async () => {
      return (await YoutubeAPI.channel(props.channelId))?.items[0] ?? null;
    },
    null,
    [props.channelId]
  );

  const channelUrl = `https://www.youtube.com/channel/${props.channelId}`;
  if (!channel || !loadedChannel) {
    return <FullCover />;
  }
  return (
    <div className="relative channel flex gap-2">
      {channel && (
        <a href={channelUrl} target="_blank" rel="noreferrer">
          <img
            src={YoutubeAPI.getBestThumbnail(channel.snippet.thumbnails)?.url}
            className="rounded-full max-h-full"
          />
        </a>
      )}
      <div className="flex flex-col justify-around">
        <a href={channelUrl} target="_blank" rel="noreferrer">
          {channel.snippet.localized.title}
        </a>
        {channel && (
          <span className="text-sm text-gray-500">
            {shortenNumberString(channel.statistics.subscriberCount, 2)}{" "}
            subscribers
          </span>
        )}
      </div>
    </div>
  );
}
