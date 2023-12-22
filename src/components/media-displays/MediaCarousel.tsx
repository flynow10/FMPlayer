import { ReactElement, useCallback, useEffect, useRef, useState } from "react";

import { Pages } from "@/src/types/pages";

import { ChevronLeft, ChevronRight } from "lucide-react";

type MediaCarouselProps = {
  children: ReactElement<
    Pages.MediaDisplay.MediaCardProps<Pages.MediaDisplay.DisplayableMediaType>
  >[];
};

export default function MediaCarousel(props: MediaCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const getCurrentlySnappedElement = () => {
    const scrollLeft = carouselRef.current?.scrollLeft ?? 0;
    const snapItems = Array.from<HTMLElement>(
      (carouselRef.current?.children ?? []) as HTMLElement[]
    );

    // Iterate over the snap items and find the currently snapped element
    for (const item of snapItems) {
      const itemOffsetLeft = item.offsetLeft;
      const itemScrollWidth = item.scrollWidth;

      if (
        scrollLeft >= itemOffsetLeft &&
        scrollLeft < itemOffsetLeft + itemScrollWidth
      ) {
        return item;
      }
    }

    return null; // No snapped element found
  };

  const scrollNext = () => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({
      left: getCurrentlySnappedElement()?.clientWidth ?? 0,
      behavior: "smooth",
    });
  };

  const scrollPrev = () => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({
      left: -(getCurrentlySnappedElement()?.clientWidth ?? 0),
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      <div
        ref={carouselRef}
        className="overflow-auto relative snap-x snap-mandatory whitespace-nowrap ml-5 flex flex-row no-scrollbar"
      >
        {props.children.map((child) => {
          return (
            <div key={child.key} className="snap-start grow-0 shrink-0 px-2">
              {child}
            </div>
          );
        })}
      </div>
      <CarouselButton
        onClick={() => scrollPrev()}
        carouselRef={carouselRef.current}
        direction={ButtonDirection.Left}
      />
      <CarouselButton
        onClick={() => scrollNext()}
        carouselRef={carouselRef.current}
        direction={ButtonDirection.Right}
      />
    </div>
  );
}

enum ButtonState {
  Hidden,
  FadeOut,
  Shown,
  FadeIn,
}

enum ButtonDirection {
  Left,
  Right,
}

type CarouselButtonProps = {
  onClick: () => void;
  carouselRef: HTMLDivElement | null;
  direction: ButtonDirection;
};

// eslint-disable-next-line react/no-multi-comp
function CarouselButton(props: CarouselButtonProps) {
  const [state, setState] = useState(ButtonState.Hidden);

  const shouldButtonShow = useCallback(() => {
    if (props.direction === ButtonDirection.Right) {
      if (!props.carouselRef) return false;
      const scrollWidth = props.carouselRef.scrollWidth;
      const scrollLeft = props.carouselRef.scrollLeft;
      const clientWidth = props.carouselRef.clientWidth;
      return scrollWidth - scrollLeft - clientWidth > 0;
    } else {
      if (!props.carouselRef) return false;
      const scrollLeft = props.carouselRef.scrollLeft;
      return scrollLeft > 0;
    }
  }, [props.direction, props.carouselRef]);

  useEffect(() => {
    const onScroll = () => {
      let update = false;
      const currentShouldButtonShown = shouldButtonShow();

      if (
        currentShouldButtonShown &&
        [ButtonState.FadeOut, ButtonState.Hidden].includes(state)
      ) {
        update = true;
        setState(ButtonState.FadeIn);
      }

      if (
        !currentShouldButtonShown &&
        [ButtonState.FadeIn, ButtonState.Shown].includes(state)
      ) {
        update = true;
        setState(ButtonState.FadeOut);
      }

      if (update) {
        setTimeout(() => {
          setState((currentState) => {
            if (currentState === ButtonState.FadeOut) {
              return ButtonState.Hidden;
            } else if (currentState === ButtonState.FadeIn) {
              return ButtonState.Shown;
            } else {
              return currentState;
            }
          });
        }, 150);
      }
    };

    if (props.carouselRef) {
      props.carouselRef.addEventListener("scroll", onScroll);

      return () => {
        props.carouselRef?.removeEventListener("scroll", onScroll);
      };
    }
  }, [props.carouselRef, state, props.direction, shouldButtonShow]);

  useEffect(() => {
    if (props.carouselRef) {
      const intersectionObserver = new IntersectionObserver(
        () => {
          setState(shouldButtonShow() ? ButtonState.Shown : ButtonState.Hidden);
        },
        {
          root: document.body,
        }
      );
      intersectionObserver.observe(props.carouselRef);

      return () => {
        intersectionObserver.disconnect();
      };
    }
  }, [props.carouselRef, shouldButtonShow]);
  return (
    <button
      onClick={props.onClick}
      className={
        (props.direction === ButtonDirection.Left ? "left-0 " : "right-0 ") +
        (state === ButtonState.Hidden ? "hidden " : "") +
        (state === ButtonState.Shown ? "opacity-100 " : "opacity-0 ") +
        "transition-opacity absolute top-0 h-full p-4 bg-gradient-to-" +
        (props.direction === ButtonDirection.Left ? "l" : "r") +
        " from-transparent to-white group"
      }
    >
      {props.direction === ButtonDirection.Left ? (
        <ChevronLeft className="group-hover:scale-125 transition-transform" />
      ) : (
        <ChevronRight className="group-hover:scale-125 transition-transform" />
      )}
    </button>
  );
}
