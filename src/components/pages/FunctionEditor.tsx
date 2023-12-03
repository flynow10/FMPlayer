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
import { Braces, Save, TextQuote, X } from "lucide-react";
import { useState } from "react";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
import { simpleLezerLinter } from "@/src/music/functions/codemirror/simple-lezer-linter";
import { codeFolding } from "@codemirror/language";
import { FMLanguage } from "@/src/music/functions/codemirror/fm-language";

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
  const [code, setCode] = useState(`Loop (3, index):
  PlayTrack (GetTrackFromList(GetAlbum("hello"), 1+2*3+4));
End;`);
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
          <button
            disabled
            className="group flex gap-2 items-center text-white bg-green-500 dark:invert p-2 px-4 rounded-md disabled:bg-green-700"
          >
            <span>Save</span>
            <Save className="group-disabled:hidden" />
            <X className="group-disabled:block hidden" />
          </button>
          <div className="flex">
            {(["blocks", "text"] as DisplayMode[]).map((type) => (
              <button
                disabled
                key={type}
                onClick={() => {
                  setDisplayMode(type);
                }}
                className={classNames(
                  "p-1",
                  "px-2",
                  "border",
                  "disabled:bg-gray-400",
                  "disabled:dark:bg-gray-200",
                  {
                    "bg-accent dark:bg-inverted-accent": displayMode === type,
                    "rounded-l-md": type === "blocks",
                    "rounded-r-md": type === "text",
                  }
                )}
              >
                {type === "blocks" ? <TextQuote /> : <Braces />}
              </button>
            ))}
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
            theme={tokyoNight} // Add theme switcher to match system theme
            extensions={[FMLanguage, simpleLezerLinter(), codeFolding()]}
            onChange={(value) => {
              setCode(value);
            }}
          />
        </FadeInOut>
      </div>
    </div>
  );
}
