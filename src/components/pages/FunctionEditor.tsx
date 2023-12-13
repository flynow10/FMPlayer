import FunctionEditorContext from "@/src/components/functions/FunctionEditorContext";
import SortableFunctionDisplay from "@/src/components/functions/SortableFunctionDisplay";
import Toolbox from "@/src/components/functions/Toolbox";
import TrackOverlay from "@/src/components/functions/drag-overlays/TrackOverlay";
import { Logo } from "@/src/components/utils/Logo";
import FadeInOut from "@/src/components/utils/animated/FadeInOut";
import { ExpandingInput } from "@/src/components/utils/input-extensions/ExpandingInput";
import { Functions } from "@/src/types/functions";
import CodeMirror from "@uiw/react-codemirror";
import classNames from "classnames";
import { Braces, Save, TextQuote, X } from "lucide-react";
import { useEffect, useState } from "react";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
// import { simpleLezerLinter } from "@/src/music/functions/codemirror/simple-lezer-linter";
// import { codeFolding } from "@codemirror/language";
// import { FMLanguage } from "@/src/music/functions/codemirror/fm-language";
import ActionOverlay from "@/src/components/functions/drag-overlays/ActionOverlay";
import NumberOverlay from "@/src/components/functions/drag-overlays/NumberOverlay";
import { createEmpty } from "@/src/music/functions/utils/create-empty";
import { validateFunction } from "@/src/music/functions/validation/validate-function";

type DisplayMode = "text" | "blocks";

export default function FunctionEditor() {
  const [functionTree, setFunctionTree] = useState<Functions.FunctionTree>(
    () => [createEmpty.play(), createEmpty.loop()]
  );
  const [title, setTitle] = useState("");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("blocks");
  const [code, setCode] = useState("");

  useEffect(() => {
    setCode(JSON.stringify(functionTree, null, 2));
  }, [functionTree]);

  useEffect(() => {
    let obj;
    try {
      obj = JSON.parse(code);
      setIsValid(validateFunction(obj));
    } catch (e) {
      setIsValid(false);
    }
  }, [code]);
  const [isValid, setIsValid] = useState(false);
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
          <span className="my-auto">Is Valid: {JSON.stringify(isValid)}</span>
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
            <ActionOverlay functionTree={functionTree} />
            <NumberOverlay functionTree={functionTree} />
          </FunctionEditorContext>
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
            extensions={
              [
                /* FMLanguage, simpleLezerLinter(), codeFolding() */
              ]
            }
            onChange={(value) => {
              setCode(value);
            }}
          />
        </FadeInOut>
      </div>
    </div>
  );
}
