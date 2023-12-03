import FunctionEditorContext from "@/src/components/functions/FunctionEditorContext";
import SortableFunctionDisplay from "@/src/components/functions/SortableFunctionDisplay";
import Toolbox from "@/src/components/functions/Toolbox";
import TrackOverlay from "@/src/components/functions/drag-overlays/TrackOverlay";
import { Logo } from "@/src/components/utils/Logo";
import FadeInOut from "@/src/components/utils/animated/FadeInOut";
import { ExpandingInput } from "@/src/components/utils/input-extensions/ExpandingInput";
import { generateGroupId } from "@/src/music/functions/utils/generate-group-id";
import { Functions } from "@/src/types/functions";
import CodeMirror from "@uiw/react-codemirror";
import classNames from "classnames";
import { Braces, Save, TextQuote } from "lucide-react";
import { useState } from "react";

type DisplayMode = "text" | "blocks";

export default function FunctionEditor() {
  const [functionTree, setFunctionTree] = useState<Functions.FunctionTree>(
    () => [
      {
        id: generateGroupId("actions"),
        children: [],
        type: "play",
        trackExpression: null,
      },
      {
        id: generateGroupId("actions"),
        children: [
          {
            id: generateGroupId("actions"),
            children: [],
            type: "play",
            trackExpression: null,
          },
          {
            id: generateGroupId("actions"),
            children: [],
            type: "loop",
          },
          {
            id: generateGroupId("actions"),
            children: [],
            type: "play",
            trackExpression: null,
          },
        ],
        type: "loop",
      },
    ]
  );
  const [title, setTitle] = useState("");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("blocks");
  const [code, setCode] = useState(`Play Tracks (<trackId>)
Play Tracks (Get Playlist (<playlistId>))
Begin Loop (Get World Variable ("day of the week")) (index)
  Define Variable (list, Get Playlist (<playlistId>));
  If (index < 3) Then
    Play Tracks (Get Track From List(list, Random(Get Track List Property (list, "length"))))
  End
  If (index > 3) Then
    If (index < 5) Then
      Play Tracks (<trackId>)
    Else
      Play Tracks (<trackId>)
    End
  End
  Play Tracks (list)
End
Play Tracks (Get Function (<functionId>, (4 + 3) * 2))`);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="border-b-2 p-2 flex gap-2">
        <Logo />
        <ExpandingInput
          value={title}
          className="p-2 py-1 focus:border-inherit text-xl border-gray-200 border-2 outline-none rounded-md"
          placeholder="Untitled Function"
          onChange={(event) => {
            setTitle(event.target.value);
          }}
        />
        <div className="ml-auto flex gap-2">
          <button className="flex gap-2 items-center text-white bg-green-400 invert p-2 px-4 rounded-md">
            <span>Save</span>
            <Save />
          </button>
          <div className="flex">
            <button
              onClick={() => {
                setDisplayMode("blocks");
              }}
              className={classNames("p-1", "px-2", "rounded-l-md", "border", {
                "bg-accent dark:bg-inverted-accent": displayMode === "blocks",
              })}
            >
              <TextQuote />
            </button>
            <button
              onClick={() => {
                setDisplayMode("text");
              }}
              className={classNames("p-1", "px-2", "rounded-r-md", "border", {
                "bg-accent dark:bg-inverted-accent": displayMode === "text",
              })}
            >
              <Braces />
            </button>
          </div>
        </div>
      </div>
      <div className="grow relative">
        <FadeInOut
          shown={displayMode === "blocks"}
          className="flex absolute top-0 left-0 right-0 bottom-0"
        >
          <FunctionEditorContext
            functionTree={functionTree}
            setFunctionTree={setFunctionTree}
          >
            <Toolbox setFunctionTree={setFunctionTree} />
            <SortableFunctionDisplay
              functionTree={functionTree}
              setFunctionTree={setFunctionTree}
            />
            <TrackOverlay functionTree={functionTree} />
          </FunctionEditorContext>
          {/* <pre className="border-l-2 p-2 text-sm overflow-auto">
        {JSON.stringify(functionTree, null, 2)}
      </pre> */}
        </FadeInOut>
        <FadeInOut
          shown={displayMode === "text"}
          className="flex absolute top-0 left-0 right-0 bottom-0"
        >
          <CodeMirror
            className="invert grow"
            height="100%"
            value={code}
            theme={"dark"} // Add theme switcher to match system theme
            onChange={(value) => {
              setCode(value);
            }}
          />
        </FadeInOut>
      </div>
    </div>
  );
}
