// Built off of http://react-autosuggest.js.org/

import SuggestionList from "@/src/components/utils/input-extensions/SuggestionList";
import { InputExtensions } from "@/src/types/input-extensions";
import { mergeClasses } from "@/src/utils/component-utils";
import {
  FocusEvent,
  FormEvent,
  HTMLAttributes,
  useEffect,
  useRef,
  useState,
} from "react";

type BaseSuggestionInputProps<S> = {
  suggestions: S[];
  getSuggestionValue: InputExtensions.GetSuggestionValue<S>;
  onSuggestionsFetchRequested: InputExtensions.SuggestionsFetchRequested;
  onSuggestionsClearRequested?: () => void;
  renderSuggestion: InputExtensions.RenderSuggestion<S>;

  inputProps: InputExtensions.InputProps<S>;
  renderInputComponent?: InputExtensions.RenderInputComponent;

  onSuggestionSelected?: InputExtensions.OnSuggestionSelected<S>;
  shouldKeepSuggestionsOnSelect?: InputExtensions.ShouldKeepOpenOnSelect<S>;
  focusInputOnSuggestionClick?: boolean;
  shouldRenderSuggestions?: InputExtensions.ShouldRenderSuggestions;

  outerContainerProps?: HTMLAttributes<HTMLDivElement>;
  suggestionsContainerProps?: HTMLAttributes<HTMLUListElement>;
};

const defaultRenderInputComponent: InputExtensions.RenderInputComponent = (
  inputProps
) => {
  return <input {...inputProps} />;
};
const defaultShouldRenderSuggestions: InputExtensions.ShouldRenderSuggestions =
  (value) => {
    return value.trim().length > 0;
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

  const shouldRenderSuggestions: InputExtensions.ShouldRenderSuggestions = (
    value,
    reason
  ) => {
    return (props.shouldRenderSuggestions ?? defaultShouldRenderSuggestions)(
      value,
      reason
    );
  };

  const maybeOnChange = (
    event: FormEvent<HTMLElement>,
    newValue: string,
    method: InputExtensions.ChangeMethod
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
    data: InputExtensions.SuggestionSelectedEventData<S>
  ) => {
    props.onSuggestionSelected?.(event, data);

    const keepSuggestions = (
      props.shouldKeepSuggestionsOnSelect ?? (() => false)
    )(data.suggestion);

    if (keepSuggestions) {
      requestSuggestionFetch({
        value: data.suggestionValue,
        reason: "suggestion-selected",
      });
    } else {
      requestSuggestionClear();
    }
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
    const shouldRender = shouldRenderSuggestions(
      props.inputProps.value,
      "input-blurred"
    );
    const highlightedSuggestion = getHighlightedSuggestion();

    setIsInputFocused(false);
    resetHighlighedSuggestion();
    setIsCollapsed(!shouldRender);

    if (blurEvent.current) {
      props.inputProps.onBlur?.(blurEvent.current, { highlightedSuggestion });
    } else {
      console.error("Blur event was null!");
    }
  };

  const onSuggestionMouseEnter: InputExtensions.SuggestionMouseEventHandler = (
    event,
    index
  ) => {
    updateHighlightedSuggestion(index);

    if (event.currentTarget === pressedSuggestion.current) {
      justSelectedSuggestion.current = true;
    }
  };

  const requestSuggestionFetch: InputExtensions.SuggestionsFetchRequested = (
    request
  ) => {
    props.onSuggestionsFetchRequested?.(request);
  };

  const requestSuggestionClear = () => {
    props.onSuggestionsClearRequested?.();
  };

  const onSuggestionMouseLeave: InputExtensions.SuggestionMouseEventHandler = (
    event
  ) => {
    resetHighlighedSuggestion(false);

    if (
      justSelectedSuggestion.current &&
      event.currentTarget === pressedSuggestion.current
    ) {
      justSelectedSuggestion.current = false;
    }
  };

  const onSuggestionMouseDown: InputExtensions.SuggestionMouseEventHandler = (
    event
  ) => {
    if (!justSelectedSuggestion.current) {
      justSelectedSuggestion.current = true;
      pressedSuggestion.current = event.currentTarget;
    }
  };

  const onSuggestionClick: InputExtensions.SuggestionMouseEventHandler = (
    event,
    index
  ) => {
    const clickedSuggestion = props.suggestions[index];
    const clickedSuggestionValue = getSuggestionValueByIndex(index);

    maybeOnChange(event, clickedSuggestionValue, "click");
    onSuggestionSelected(event, {
      method: "click",
      suggestion: clickedSuggestion,
      suggestionIndex: index,
      suggestionValue: clickedSuggestionValue,
    });

    if (props.focusInputOnSuggestionClick ?? false) {
      input.current?.focus();
    } else {
      onBlur();
    }

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

  const inputProps: InputExtensions.RenderableInputComponentProps = {
    type: "text",
    ...props.inputProps,
    onChange: (event) => {
      const newValue = event.target.value;
      const shouldRender = shouldRenderSuggestions(newValue, "input-changed");

      maybeOnChange(event, newValue, "type");
      setValueBeforeUpDown(null);
      setHighlightedIndex(null);
      setIsCollapsed(!shouldRender);

      if (shouldRender) {
        requestSuggestionFetch({
          value: newValue,
          reason: "input-changed",
        });
      } else {
        requestSuggestionClear();
      }
    },
    onBlur: (event) => {
      if (justClickedOnSuggestionContainer.current) {
        input.current?.focus();
        return;
      }

      blurEvent.current = event;

      if (!justSelectedSuggestion.current) {
        onBlur();
        requestSuggestionClear();
      }
    },
    onFocus: (event) => {
      if (
        !justSelectedSuggestion.current &&
        !justClickedOnSuggestionContainer.current
      ) {
        console.log("Focused!");
        const value = props.inputProps.value;
        const shouldRender = shouldRenderSuggestions(value, "input-focused");
        setIsInputFocused(true);
        setIsCollapsed(!shouldRender);

        props.inputProps.onFocus?.(event);
        if (shouldRender) {
          requestSuggestionFetch({
            value: value,
            reason: "input-focused",
          });
        }
      }
    },
    onKeyDown: (event) => {
      switch (event.key) {
        case "ArrowDown":
        case "ArrowUp": {
          const value = props.inputProps.value;
          if (isCollapsed) {
            if (shouldRenderSuggestions(value, "suggestions-revealed")) {
              requestSuggestionFetch({ value, reason: "suggestions-revealed" });
              setIsCollapsed(false);
              event.preventDefault();
            }
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
            event.preventDefault();
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
            event.preventDefault();
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
          if (isOpen) {
            event.preventDefault();
          }
          const willClose = isOpen;
          if (valueBeforeUpDown === null) {
            if (!willClose) {
              const newValue = "";
              maybeOnChange(event, newValue, "escape");
              if (shouldRenderSuggestions(newValue, "escape-pressed")) {
                requestSuggestionFetch({
                  value: newValue,
                  reason: "escape-pressed",
                });
              } else {
                requestSuggestionClear();
              }
            }
          } else {
            maybeOnChange(event, valueBeforeUpDown, "escape");
          }
          if (willClose) {
            requestSuggestionClear();
            hideSuggestions();
          } else {
            resetHighlighedSuggestion();
          }
          break;
        }
      }
      props.inputProps.onKeyDown?.(event);
    },
    ref: setInputRef,
  };

  const shouldRender = shouldRenderSuggestions(
    props.inputProps.value,
    "render"
  );
  const isOpen =
    isInputFocused &&
    !isCollapsed &&
    props.suggestions.length > 0 &&
    shouldRender;
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
