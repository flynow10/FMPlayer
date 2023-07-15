import {
  ButtonHTMLAttributes,
  FocusEvent,
  FormEvent,
  InputHTMLAttributes,
  LiHTMLAttributes,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  Ref,
  RefCallback,
} from "react";

export namespace InputExtensions {
  export namespace Search {
    export type SubmitSearch<S> = (search: string, suggestion?: S) => void;

    export type InputProps<S> = Omit<
      InputExtensions.InputProps<S>,
      "onChange" | "ref" | "value"
    >;

    export type SearchButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
      buttonText?: string | ((search: string) => ReactNode);
    };
  }
  export type SuggestionMouseEventHandler = (
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

  export type ChangeMethod =
    | "down"
    | "up"
    | "escape"
    | "enter"
    | "click"
    | "type";

  export type FetchRequestedReasons =
    | "input-changed"
    | "input-focused"
    | "escape-pressed"
    | "suggestions-revealed"
    | "suggestion-selected";

  export type ShouldRenderReasons =
    | "input-changed"
    | "input-focused"
    | "input-blurred"
    | "escape-pressed"
    | "suggestions-revealed"
    | "suggestions-updated"
    | "render";

  export type ChangeEventParams = {
    newValue: string;
    method: ChangeMethod;
  };

  export type ChangeEventHandler = (
    event: FormEvent<HTMLElement>,
    params: ChangeEventParams
  ) => void;

  export type BlurEventParams<S> = {
    highlightedSuggestion: S | null;
  };

  export type BlurEventHandler<S> = (
    event: FocusEvent<HTMLElement>,
    params?: BlurEventParams<S>
  ) => void;

  export type InputProps<S> = Omit<
    InputHTMLAttributes<HTMLElement>,
    "onChange" | "onBlur"
  > & {
    onChange: ChangeEventHandler;
    onBlur?: BlurEventHandler<S> | undefined;
    value: string;
    ref?: RefCallback<HTMLInputElement> | undefined;
  };

  export type RenderSuggestionParams = {
    query: string;
    isHighlighted: boolean;
  };

  export type RenderableInputComponentProps =
    InputHTMLAttributes<HTMLInputElement> & {
      value: string;
      ref?: Ref<HTMLInputElement> | undefined;
    };

  export type RenderInputComponent = (
    inputProps: RenderableInputComponentProps
  ) => ReactNode;

  export type SuggestionsFetchRequestedParams = {
    value: string;
    reason: FetchRequestedReasons;
  };

  export type SuggestionsFetchRequested = (
    request: SuggestionsFetchRequestedParams
  ) => void;

  export type GetSuggestionValue<S> = (suggestion: S) => string;

  export type SuggestionSelectMethod = "click" | "enter";

  export type SuggestionSelectedEventData<S> = {
    suggestion: S;
    suggestionValue: string;
    suggestionIndex: number;
    method: SuggestionSelectMethod;
  };

  export type OnSuggestionSelected<S> = (
    event: FormEvent<HTMLElement>,
    data: SuggestionSelectedEventData<S>
  ) => void;

  export type ShouldKeepOpenOnSelect<S> = (suggestions: S) => boolean;
  export type ShouldRenderSuggestions = (
    value: string,
    reason: ShouldRenderReasons
  ) => boolean;
}
