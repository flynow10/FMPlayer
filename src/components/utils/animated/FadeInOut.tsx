import {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
  useLayoutEffect,
  useState,
} from "react";

type FadeInOutProps = HTMLAttributes<HTMLDivElement> & {
  shown: boolean;
  duration?: number;
  children: ReactNode;
};

enum TransitionState {
  Entering,
  Entered,
  Exiting,
  Exited,
  Unmounted,
}

const transitionStyles: Partial<Record<TransitionState, CSSProperties>> = {
  [TransitionState.Entering]: { opacity: 0 },
  [TransitionState.Entered]: { opacity: 1 },
  [TransitionState.Exiting]: { opacity: 0 },
  [TransitionState.Exited]: { opacity: 0 },
};

export default function FadeInOut({
  shown,
  duration: _duration,
  children,
  ...props
}: FadeInOutProps) {
  const [state, setState] = useState<TransitionState>(
    shown ? TransitionState.Entered : TransitionState.Unmounted
  );

  useLayoutEffect(() => {
    let nextState = null;
    if (state === TransitionState.Entering) {
      setTimeout(() => {
        setState(TransitionState.Entered);
      }, 10);
      return;
    }
    if (shown) {
      if (state !== TransitionState.Entered) {
        nextState = TransitionState.Entering;
      }
    } else {
      if (state === TransitionState.Entered) {
        nextState = TransitionState.Exiting;
      }
    }
    if (nextState !== null) {
      setState(nextState);
    } else if (state === TransitionState.Exited) {
      setState(TransitionState.Unmounted);
    }
  }, [shown, state]);

  if (state === TransitionState.Unmounted) {
    return null;
  }
  const duration = _duration ?? 250;
  return (
    <div
      {...props}
      style={{
        ...props.style,
        transition: `opacity ${duration}ms ease-in-out`,
        opacity: 0.1,
        ...transitionStyles[state],
      }}
      onTransitionEnd={() => {
        if (state === TransitionState.Entering) {
          setState(TransitionState.Entered);
        }
        if (state === TransitionState.Exiting) {
          setState(TransitionState.Exited);
        }
      }}
    >
      {children}
    </div>
  );
}
