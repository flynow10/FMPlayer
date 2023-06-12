import { NavigationMethod, PlayByID } from "./Main";
import { Car, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { PageType } from "./Page";
import { MediaType } from "@/src/utils/types";
import { ReactElement, useEffect, useRef, useState } from "react";

export type MediaCardProps = {
  id: string;
  title: string;
  mediaType: MediaType;
  size?: MediaCardSize;
  onPlayMedia: PlayByID;
  onNavigate: NavigationMethod;
};

export enum MediaCardSize {
  Small,
  Medium,
  Large,
}

export function MediaCard(props: MediaCardProps) {
  const size = props.size || MediaCardSize.Small;
  if (size !== MediaCardSize.Small) {
    return (
      <div
        className={
          "flex flex-col" + (size === MediaCardSize.Large ? " w-96" : " w-52")
        }
        role="button"
      >
        <div
          className="group relative aspect-square overflow-hidden shadow-[0_3px_10px_rgb(0,0,0,0.2)] rounded-2xl"
          onClick={() => {
            props.onPlayMedia(props.id, props.mediaType);
          }}
        >
          <img
            src={
              /* album.coverUrl ? album.coverUrl :  */ "./square-placeholder.jpg"
            }
            className="w-full h-full group-hover:blur transition-[filter]"
          />
          <Play
            size={48}
            className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        </div>
        <a
          className="h-12 mt-1 overflow-ellipsis overflow-clip break-words hover:underline"
          role="link"
          onClick={() => {
            props.onNavigate("new", PageType.AlbumDisplay, props.id);
          }}
        >
          {props.title}
        </a>
      </div>
    );
  } else {
    return <span>Not Implemented</span>;
  }
}

export type MediaCarouselProps = {
  children: ReactElement<MediaCardProps>[];
};

export function MediaCarousel(props: MediaCarouselProps) {
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
function CarouselButton(props: CarouselButtonProps) {
  const [state, setState] = useState(ButtonState.Hidden);

  function shouldButtonShow() {
    return props.direction === ButtonDirection.Right
      ? shouldRightButtonShow()
      : shouldLeftButtonShow();
  }

  function shouldRightButtonShow() {
    if (!props.carouselRef) return false;
    const scrollWidth = props.carouselRef.scrollWidth;
    const scrollLeft = props.carouselRef.scrollLeft;
    const clientWidth = props.carouselRef.clientWidth;
    return scrollWidth - scrollLeft - clientWidth > 0;
  }

  function shouldLeftButtonShow() {
    if (!props.carouselRef) return false;
    const scrollLeft = props.carouselRef.scrollLeft;
    return scrollLeft > 0;
  }

  useEffect(() => {
    const onScroll = () => {
      var update = false;
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
    return () => {};
  }, [props.carouselRef, state, props.direction]);

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
  }, [props.carouselRef]);
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
