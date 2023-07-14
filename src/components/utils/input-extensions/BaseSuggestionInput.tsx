// Built off of http://react-autosuggest.js.org/

import SuggestionList from "@/src/components/utils/input-extensions/SuggestionList";
import { mergeClasses } from "@/src/utils/component-utils";
import {
  FocusEvent,
  FormEvent,
  HTMLAttributes,
  InputHTMLAttributes,
  LiHTMLAttributes,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  Ref,
  useEffect,
  useRef,
  useState,
} from "react";

type SuggestionMouseEventHandler = (
  event: ReactMouseEvent<HTMLLIElement>,
  suggestionIndex: number
) => void;

export type SuggestionAttributes = Omit<
  LiHTMLAttributes<HTMLLIElement>,
  "onMouseEnter" | "onMouseLeave" | "onMouseDown" | "onClick"
> & {
  onMouseEnter?: SuggestionMouseEventHandler;
  onMouseLeave?: SuggestionMouseEventHandler;
  onMouseDown?: SuggestionMouseEventHandler;
  onClick?: SuggestionMouseEventHandler;
};

export type RenderSuggestion<S> = (
  suggestion: S,
  params: RenderSuggestionParams
) => ReactNode;

type ChangeMethod = "down" | "up" | "escape" | "enter" | "click" | "type";
type ChangeEvent = {
  newValue: string;
  method: ChangeMethod;
};

type BlurEventParams<S> = {
  highlightedSuggestion: S | null;
};

type InputProps<S> = Omit<
  React.InputHTMLAttributes<HTMLElement>,
  "onChange" | "onBlur"
> & {
  onChange: (event: FormEvent<HTMLElement>, params: ChangeEvent) => void;
  onBlur?:
    | ((event: FocusEvent<HTMLElement>, params?: BlurEventParams<S>) => void)
    | undefined;
  value: string;
  ref?: React.RefCallback<HTMLInputElement> | undefined;
};

type RenderSuggestionParams = {
  query: string;
  isHighlighted: boolean;
};

type RenderableInputComponentProps = InputHTMLAttributes<HTMLInputElement> & {
  value: string;
  ref?: Ref<HTMLInputElement> | undefined;
};

type RenderInputComponent = (
  inputProps: RenderableInputComponentProps
) => ReactNode;

type FetchRequestedReasons =
  | "input-changed"
  | "input-focused"
  | "escape-pressed"
  | "suggestions-revealed"
  | "suggestion-selected";

type SuggestionsFetchRequestedParams = {
  value: string;
  reason: FetchRequestedReasons;
};

type SuggestionsFetchRequested = (
  request: SuggestionsFetchRequestedParams
) => void;

type SuggestionSelectMethod = "click" | "enter";

interface SuggestionSelectedEventData<S> {
  suggestion: S;
  suggestionValue: string;
  suggestionIndex: number;
  method: SuggestionSelectMethod;
}

type OnSuggestionSelected<S> = (
  event: React.FormEvent<HTMLElement>,
  data: SuggestionSelectedEventData<S>
) => void;

type BaseSuggestionInputProps<S> = {
  suggestions: S[];
  getSuggestionValue: (suggestion: S) => string;
  onSuggestionsFetchRequested: SuggestionsFetchRequested;
  renderSuggestion: RenderSuggestion<S>;

  inputProps: InputProps<S>;
  renderInputComponent?: RenderInputComponent;

  onSuggestionSelected?: OnSuggestionSelected<S>;

  outerContainerProps?: HTMLAttributes<HTMLDivElement>;
  suggestionsContainerProps?: HTMLAttributes<HTMLUListElement>;
};

const defaultRenderInputComponent: RenderInputComponent = (inputProps) => {
  return <input {...inputProps} />;
};

export default function BaseSuggestionInput<S>(
  props: BaseSuggestionInputProps<S>
) {
  // State
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [valueBeforeUpDown, setValueBeforeUpDown] = useState<string | null>(
    null
  );
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  // Refs
  const input = useRef<HTMLInputElement | null>(null);
  const suggestionContainer = useRef<HTMLUListElement | null>(null);
  const justSelectedSuggestion = useRef(false);
  const justClickedOnSuggestionContainer = useRef(false);
  const pressedSuggestion = useRef<HTMLLIElement | null>(null);
  const blurEvent = useRef<FocusEvent<HTMLInputElement> | null>(null);

  // Functions
  const getQuery = () => {
    return (valueBeforeUpDown ?? props.inputProps.value).trim();
  };

  const hideSuggestions = () => {
    setIsCollapsed(true);
    setHighlightedIndex(null);
    setValueBeforeUpDown(null);
  };

  const showSuggestions = () => {
    setIsCollapsed(false);
  };

  const maybeOnChange = (
    event: FormEvent<HTMLElement>,
    newValue: string,
    method: ChangeMethod
  ) => {
    const prevValue = props.inputProps.value;

    if (newValue !== prevValue) {
      props.inputProps.onChange(event, { method, newValue });
    }
  };

  const resetHighlighedSuggestion = (shouldResetValueBeforeUpDown = true) => {
    setHighlightedIndex(null);
    if (shouldResetValueBeforeUpDown) {
      setValueBeforeUpDown(null);
    }
  };

  const onSuggestionSelected = (
    event: FormEvent<HTMLElement>,
    data: SuggestionSelectedEventData<S>
  ) => {
    props.onSuggestionSelected?.(event, data);
    resetHighlighedSuggestion();
  };

  const getNextHighlightIndex = (direction: "up" | "down") => {
    const lastSuggestion = props.suggestions.length - 1;
    if (highlightedIndex === null) {
      if (direction === "up") {
        return lastSuggestion;
      } else {
        return 0;
      }
    }
    if (highlightedIndex === lastSuggestion && direction === "down") {
      return 0;
    }
    if (highlightedIndex === 0 && direction === "up") {
      return null;
    }
    return highlightedIndex + (direction === "up" ? -1 : 1);
  };

  const getHighlightedSuggestion = () => {
    if (highlightedIndex !== null) {
      return props.suggestions[highlightedIndex];
    }
    return null;
  };

  const getSuggestionValueByIndex = (index: number) => {
    return props.getSuggestionValue(props.suggestions[index]);
  };

  const updateHighlightedSuggestion = (
    index: number | null,
    prevValue?: string
  ) => {
    setValueBeforeUpDown((value) => {
      if (index === null) {
        return null;
      } else if (value === null && prevValue !== undefined) {
        return prevValue;
      }
      return value;
    });

    setHighlightedIndex(index);
  };

  const onBlur = () => {
    const highlightedSuggestion = getHighlightedSuggestion();

    setIsInputFocused(false);
    resetHighlighedSuggestion();

    if (blurEvent.current) {
      props.inputProps.onBlur?.(blurEvent.current, { highlightedSuggestion });
    } else {
      console.error("Blur event was null!");
    }
  };

  const onSuggestionMouseEnter: SuggestionMouseEventHandler = (
    event,
    index
  ) => {
    updateHighlightedSuggestion(index);

    if (event.currentTarget === pressedSuggestion.current) {
      justSelectedSuggestion.current = true;
    }
  };

  const onSuggestionMouseLeave: SuggestionMouseEventHandler = (event) => {
    resetHighlighedSuggestion();

    if (
      justSelectedSuggestion.current &&
      event.currentTarget === pressedSuggestion.current
    ) {
      justSelectedSuggestion.current = false;
    }
  };

  const onSuggestionMouseDown: SuggestionMouseEventHandler = (event) => {
    if (!justSelectedSuggestion.current) {
      justSelectedSuggestion.current = true;
      pressedSuggestion.current = event.currentTarget;
    }
  };

  const onSuggestionClick: SuggestionMouseEventHandler = (event, index) => {
    const clickedSuggestion = props.suggestions[index];
    const clickedSuggestionValue = getSuggestionValueByIndex(index);

    maybeOnChange(event, clickedSuggestionValue, "click");
    onSuggestionSelected(event, {
      method: "click",
      suggestion: clickedSuggestion,
      suggestionIndex: index,
      suggestionValue: clickedSuggestionValue,
    });

    onBlur();

    setTimeout(() => {
      justSelectedSuggestion.current = false;
    });
  };

  const setInputRef = (inputElement: HTMLInputElement) => {
    input.current = inputElement;
    if (typeof props.inputProps.ref === "function") {
      props.inputProps.ref(inputElement);
    }
  };

  // Effects

  useEffect(() => {
    const onDocumentMouseUp = () => {
      if (pressedSuggestion.current && !justSelectedSuggestion.current) {
        input.current?.focus();
      }
      pressedSuggestion.current = null;
    };

    const onDocumentMouseDown = (event: MouseEvent) => {
      justClickedOnSuggestionContainer.current = false;

      if (event.target instanceof HTMLElement) {
        let node: HTMLElement | null = event.target;

        while (node !== null && node !== document.documentElement) {
          if (node.getAttribute("data-suggestion-index") !== null) {
            return;
          }

          if (node === suggestionContainer.current) {
            justClickedOnSuggestionContainer.current = true;
            return;
          }

          node = node.parentElement;
        }
      }
    };

    document.addEventListener("mouseup", onDocumentMouseUp);
    document.addEventListener("mousedown", onDocumentMouseDown);
    return () => {
      document.removeEventListener("mouseup", onDocumentMouseUp);
      document.removeEventListener("mousedown", onDocumentMouseDown);
    };
  }, []);

  // Components

  const inputProps: RenderableInputComponentProps = {
    type: "text",
    ...mergeClasses(props.inputProps, "w-full"),
    onChange: (event) => {
      const newValue = event.target.value;

      maybeOnChange(event, newValue, "type");
      setValueBeforeUpDown(null);
      setHighlightedIndex(null);
      setIsCollapsed(false);

      props.onSuggestionsFetchRequested({
        value: newValue,
        reason: "input-changed",
      });
    },
    onBlur: (event) => {
      if (justClickedOnSuggestionContainer.current) {
        input.current?.focus();
        return;
      }

      blurEvent.current = event;

      if (!justSelectedSuggestion.current) {
        onBlur();
      }
    },
    onFocus: (event) => {
      if (
        !justSelectedSuggestion.current &&
        !justClickedOnSuggestionContainer.current
      ) {
        setIsInputFocused(true);
        showSuggestions();

        props.inputProps.onFocus?.(event);

        props.onSuggestionsFetchRequested({
          value: props.inputProps.value,
          reason: "input-focused",
        });
      }
    },
    onKeyDown: (event) => {
      let cancelEvent = true;
      switch (event.key) {
        case "ArrowDown":
        case "ArrowUp": {
          if (isCollapsed) {
            showSuggestions();
          } else if (props.suggestions.length > 0) {
            const newHighlightIndex = getNextHighlightIndex(
              event.key === "ArrowDown" ? "down" : "up"
            );
            let newValue: string;

            if (newHighlightIndex === null) {
              newValue = valueBeforeUpDown ?? props.inputProps.value;
            } else {
              newValue = getSuggestionValueByIndex(newHighlightIndex);
            }

            updateHighlightedSuggestion(
              newHighlightIndex,
              props.inputProps.value
            );
            maybeOnChange(
              event,
              newValue,
              event.key === "ArrowDown" ? "down" : "up"
            );
            break;
          }
          break;
        }
        case "Enter": {
          if (event.keyCode === 229) {
            break;
          }

          const highlightedSuggestion = getHighlightedSuggestion();
          if (isOpen) {
            hideSuggestions();
          }

          if (highlightedSuggestion !== null && highlightedIndex !== null) {
            const newValue = props.getSuggestionValue(highlightedSuggestion);
            maybeOnChange(event, newValue, "enter");

            onSuggestionSelected(event, {
              method: "enter",
              suggestion: highlightedSuggestion,
              suggestionIndex: highlightedIndex,
              suggestionValue: newValue,
            });
          }
          break;
        }
        case "Escape": {
          const willClose = isOpen;
          if (valueBeforeUpDown === null) {
            if (!willClose) {
              const newValue = "";
              maybeOnChange(event, newValue, "escape");
              props.onSuggestionsFetchRequested({
                value: newValue,
                reason: "escape-pressed",
              });
            }
          } else {
            maybeOnChange(event, valueBeforeUpDown, "escape");
          }
          if (willClose) {
            hideSuggestions();
          }
          break;
        }
        default: {
          cancelEvent = false;
        }
      }
      if (cancelEvent) {
        event.preventDefault();
      }
      props.inputProps.onKeyDown?.(event);
    },
    ref: setInputRef,
  };

  const isOpen = isInputFocused && !isCollapsed && props.suggestions.length > 0;
  const suggestions = isOpen ? props.suggestions : [];

  const inputComponent = (
    props.renderInputComponent ?? defaultRenderInputComponent
  )(inputProps);

  const suggestionList = (
    <SuggestionList
      itemProps={{
        onMouseEnter: onSuggestionMouseEnter,
        onMouseLeave: onSuggestionMouseLeave,
        onMouseDown: onSuggestionMouseDown,
        onClick: onSuggestionClick,
      }}
      suggestions={suggestions}
      highlightedSuggestion={highlightedIndex}
      query={getQuery()}
      containerProps={props.suggestionsContainerProps}
      getSuggestionValue={props.getSuggestionValue}
      renderSuggestion={props.renderSuggestion}
      containerRef={(ul) => {
        suggestionContainer.current = ul;
      }}
    />
  );
  return (
    <div {...mergeClasses(props.outerContainerProps ?? {}, "relative")}>
      {inputComponent}
      {suggestionList}
    </div>
  );
}
