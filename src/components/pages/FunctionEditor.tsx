import { useCallback, useEffect, useMemo, useState } from "react";

// import { simpleLezerLinter } from "@/src/music/functions/codemirror/simple-lezer-linter";
// import { codeFolding } from "@codemirror/language";
// import { FMLanguage } from "@/src/music/functions/codemirror/fm-language";
import ActionOverlay from "@/src/components/functions/drag-overlays/ActionOverlay";
import NumberOverlay from "@/src/components/functions/drag-overlays/NumberOverlay";
import TrackOverlay from "@/src/components/functions/drag-overlays/TrackOverlay";
import FunctionEditorContext from "@/src/components/functions/FunctionEditorContext";
import SortableFunctionDisplay from "@/src/components/functions/SortableFunctionDisplay";
import Toolbox from "@/src/components/functions/Toolbox";
import FadeInOut from "@/src/components/utils/animated/FadeInOut";
import ExpandingInput from "@/src/components/utils/input-extensions/ExpandingInput";
import Logo from "@/src/components/utils/Logo";

import { usePageContext } from "@/src/contexts/PageContext";
import { validateFunction } from "@/src/music/functions/validation/validate-function";
import { MusicLibrary } from "@/src/music/library/music-library";
import { Functions } from "@/src/types/functions";
import { Music } from "@/src/types/music";

import { Prisma } from "@prisma/client";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
import CodeMirror from "@uiw/react-codemirror";
import classNames from "classnames";
import { Braces, Save, TextQuote, X } from "lucide-react";
import { toast } from "react-toastify";

type DisplayMode = "text" | "blocks";

export default function FunctionEditor() {
  const pages = usePageContext();
  const { isNew, id: oldFunctionId } = pages.data as
    | { isNew: false; id: string }
    | { isNew: true; id: null };
  const [functionTree, setFunctionTree] = useState<Functions.FunctionTree>([]);
  const [originalFunctionData, setOriginalFunctionData] =
    useState<Music.DB.TableType<"Function"> | null>(null);
  const [title, setTitle] = useState("");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("blocks");
  const [code, setCode] = useState("");
  const [isCodeValid, setIsCodeValid] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!isNew) {
        const functionData = await MusicLibrary.db.function.get({
          id: oldFunctionId,
        });
        if (!functionData) {
          alert("Function editor failed to load!");
          throw new Error("Failed to load current function data!");
        }
        if (active) {
          setOriginalFunctionData(functionData);
          setTitle(functionData.title);
          if (validateFunction(functionData.functionData)) {
            setFunctionTree(functionData.functionData);
          } else {
            alert("Function data was corrupt and failed to load!");
          }
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [isNew, oldFunctionId]);

  useEffect(() => {
    try {
      const obj = JSON.parse(code);
      if (validateFunction(obj)) {
        setFunctionTree(obj);
        setIsCodeValid(true);
      } else {
        setIsCodeValid(false);
      }
    } catch (e) {
      setIsCodeValid(false);
    }
  }, [code]);

  const isFunctionValid = useMemo(
    () => validateFunction(functionTree),
    [functionTree]
  );

  const canSwitch = isFunctionValid && (displayMode !== "text" || isCodeValid);

  const canSave = canSwitch && title.trim().length > 0;

  const saveFunction = useCallback(async () => {
    if (!canSave) {
      alert("This function isn't saveable right now!");
      return;
    }
    const toastId = toast(`${isNew ? "Creating" : "Updating"} function...`, {
      autoClose: false,
      isLoading: true,
      closeButton: false,
      closeOnClick: false,
      draggable: false,
      type: "info",
    });
    if (isNew) {
      pages.navigate("back");
      const newFunction = await MusicLibrary.db.function.create({
        title,
        functionData: functionTree as unknown as Prisma.JsonArray,
      });
      const success = newFunction !== null;

      toast.update(toastId, {
        render: success
          ? `Successfully created function "${newFunction.title}"`
          : "Failed to update function!",
        autoClose: 5000,
        draggable: true,
        closeOnClick: true,
        closeButton: true,
        isLoading: false,
        type: success ? "success" : "error",
      });
    } else {
      if (!originalFunctionData) {
        alert("Failed to save function!");
        return;
      }
      pages.navigate("back");

      const updatedFunction = await MusicLibrary.db.function.update(
        {
          id: originalFunctionData.id,
        },
        {
          title: title,
          functionData: functionTree as unknown as Prisma.JsonArray,
        }
      );
      const success = updatedFunction !== null;

      toast.update(toastId, {
        render: (
          <span>
            {success
              ? "Successfully updated function"
              : "Failed to update function!"}
          </span>
        ),
        autoClose: 5000,
        draggable: true,
        closeOnClick: true,
        closeButton: true,
        isLoading: false,
        type: success ? "success" : "error",
      });
    }
  }, [functionTree, isNew, canSave, originalFunctionData, pages, title]);

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
            disabled={!canSave}
            onClick={() => {
              saveFunction();
            }}
            className="group flex gap-2 items-center text-white bg-green-500 dark:invert p-2 px-4 rounded-md disabled:bg-gray-700"
          >
            <span>Save</span>
            <Save className="group-disabled:hidden" />
            <X className="group-disabled:block hidden" />
          </button>
          <div className="flex">
            {(["blocks", "text"] as DisplayMode[]).map((type) => (
              <button
                key={type}
                disabled={!canSwitch}
                onClick={() => {
                  if (type === "text") {
                    setCode(JSON.stringify(functionTree, null, 2));
                  }
                  setDisplayMode(type);
                }}
                className={classNames(
                  "p-1",
                  "px-2",
                  "border",
                  "disabled:border-accent-muted",
                  "disabled:dark:border-inverted-accent-muted",
                  {
                    "bg-accent dark:bg-inverted-accent": displayMode === type,
                    "disabled:bg-accent-muted disabled:dark:bg-inverted-accent-muted":
                      displayMode === type,
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
