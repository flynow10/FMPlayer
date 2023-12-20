import placeholder from "@/src/assets/imgs/square-placeholder.jpg";

import classNames from "classnames";
type ArtworkProps = {
  id: string | null;
  className?: string;
  imgClassName?: string;
} & Partial<Options>;

type Options = {
  fillContainer: boolean;
  rounded: boolean;
};

export default function Artwork(props: ArtworkProps) {
  const defaultOptions: Options = Object.assign(
    {},
    {
      fillContainer: true,
      rounded: true,
    },
    props
  );

  return (
    <div
      className={classNames(
        "aspect-square overflow-hidden",
        {
          "w-full h-full": defaultOptions.fillContainer,
          "rounded-lg": defaultOptions.rounded,
        },
        props.className
      )}
    >
      <img
        src={/* album.coverUrl ? album.coverUrl :  */ placeholder}
        className={props.imgClassName}
      />
    </div>
  );
}
