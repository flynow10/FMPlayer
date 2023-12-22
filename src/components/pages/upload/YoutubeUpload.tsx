import { useCallback, useEffect, useRef, useState } from "react";

import MetadataEditor from "@/src/components/utils/MetadataEditor";
import VerticalSplit from "@/src/components/utils/VerticalSplit";
import ChannelDisplay from "@/src/components/utils/youtube/ChannelDisplay";

import { YoutubeAPI } from "@/src/api/youtube-API";
import { FileContext } from "@/src/contexts/FileContext";
import { usePageContext } from "@/src/contexts/PageContext";
import { useAudioPlayer } from "@/src/hooks/use-audio-player";
import { MusicLibrary } from "@/src/music/library/music-library";
import { API } from "@/src/types/api";
import { Music } from "@/src/types/music";
import { Pages } from "@/src/types/pages";
import { splitOutUrls } from "@/src/utils/url-utils";

import { Loader2, Play } from "lucide-react";
import { toast } from "react-toastify";
import Youtube from "react-youtube";
import { v4 as uuid } from "uuid";

export default function YoutubeUpload() {
  const pages = usePageContext();
  const audioPlayer = useAudioPlayer();
  const video = pages.data.video as API.Youtube.Video;
  const [metadata, setMetadata] = useState<Music.Files.NewTrackMetadata>(() => {
    return {
      id: uuid(),
      title: video.snippet.title,
      artists: [{ name: video.snippet.channelTitle, type: "MAIN" }],
      genre: "",
      albumId: null,
      tags: [],
      artworkUrl: null,
    };
  });

  const [isUploading, setIsUploading] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const youtubeRef = useRef<Youtube>(null);

  useEffect(() => {
    const onPlayAppAudio = () => {
      youtubeRef.current?.internalPlayer?.pauseVideo();
    };
    audioPlayer.addEventListener("play", onPlayAppAudio);

    return () => {
      audioPlayer.removeEventListener("play", onPlayAppAudio);
    };
  }, [audioPlayer]);

  const parsedDescription = splitOutUrls(video.snippet.description).map(
    (split, index) => {
      if (split.type === "string") {
        return <span key={index}>{split.data}</span>;
      } else {
        return (
          <span key={index}>
            <a
              target="_blank"
              rel="noreferrer"
              href={split.data}
              className="underline"
            >
              {split.data}
            </a>
          </span>
        );
      }
    }
  );

  const setFileMetadataProperty =
    useCallback<Pages.Upload.SetFileMetadataFunction>(
      (_fileId, property, value) => {
        if (isUploading) {
          return;
        }
        setMetadata((prev) => {
          return {
            ...prev,
            [property]: value,
          };
        });
      },
      [setMetadata, isUploading]
    );

  const uploadVideo = async () => {
    youtubeRef.current?.internalPlayer?.stopVideo();
    setIsUploading(true);
    try {
      const track = await MusicLibrary.uploadNewTrack(metadata);
      if (!track) {
        throw new Error("Failed to create new track in database!");
      }
      await MusicLibrary.audio.downloadYoutubeVideo(video.id, track.id);
    } catch (e) {
      console.error(e);
      toast(`Failed to upload ${metadata.title}!`, {
        type: "error",
      });
      return;
    }

    toast(`Completed preupload for ${metadata.title}`, {
      type: "success",
    });
    pages.navigate("back");
  };

  return (
    <FileContext.Provider value={metadata}>
      <VerticalSplit
        left={
          <div className="flex flex-col h-full relative">
            <div className="flex p-4 gap-5 flex-col overflow-y-auto">
              <div className="flex flex-col gap-1">
                <Youtube
                  videoId={video.id}
                  className={showVideo ? "" : " hidden"}
                  iframeClassName="overflow-hidden rounded-lg aspect-video w-full"
                  opts={{
                    playerVars: {
                      controls: 1,
                      rel: 0,
                    },
                  }}
                  onPlay={() => {
                    setShowVideo(true);
                    audioPlayer.pauseAudio();
                  }}
                  ref={youtubeRef}
                  title={metadata.title}
                />
                <div
                  className={
                    "w-full aspect-video" + (showVideo ? " hidden" : "")
                  }
                  onClick={() => {
                    setShowVideo(true);
                    youtubeRef.current?.internalPlayer?.playVideo();
                  }}
                >
                  <div className="relative group cursor-pointer rounded-lg overflow-hidden">
                    <img
                      src={
                        YoutubeAPI.getBestThumbnail(video.snippet.thumbnails)
                          ?.url
                      }
                      className="object-cover w-auto"
                    />
                    <div className="absolute left-0 top-0 w-full h-full bg-black bg-opacity-20 group-hover:block hidden">
                      <Play
                        size={48}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white z-10"
                      />
                    </div>
                  </div>
                </div>
                <span>{video.snippet.title}</span>
              </div>
              <div className="relative channel border-2 rounded-md p-3 h-20 flex gap-2">
                <span className="absolute -top-4 left-2 text-gray-400 bg-white px-1">
                  Channel
                </span>
                <ChannelDisplay channelId={video.snippet.channelId} />
              </div>
              <div className="p-2 min-h-[100px] max-h-fit rounded-md border-2 relative">
                <span className="absolute -top-4 left-2 text-gray-400 bg-white px-1">
                  Description
                </span>
                <p className="whitespace-pre-wrap overflow-y-auto h-full">
                  {parsedDescription}
                </p>
              </div>
            </div>
            <div className="shrink-0 flex flex-col border-t-2 p-4">
              <button
                className="btn success flex justify-center"
                disabled={isUploading}
                onClick={() => {
                  if (
                    confirm(
                      "Are you sure you want to upload this youtube video?"
                    )
                  ) {
                    uploadVideo();
                  }
                }}
              >
                {isUploading ? (
                  <span className="flex gap-2">
                    Adding Audio
                    <Loader2 className="animate-spin" />
                  </span>
                ) : (
                  "Add Audio to Library"
                )}
              </button>
            </div>
          </div>
        }
        right={
          <div className="p-7 h-full overflow-auto relative">
            <MetadataEditor setFileMetadata={setFileMetadataProperty} />
          </div>
        }
        minWidth={500}
        defaultPosition="left"
      />
    </FileContext.Provider>
  );
}
