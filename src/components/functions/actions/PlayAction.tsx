import TrackDroppable from "@/src/components/functions/droppables/TrackDroppable";
import { Functions } from "@/src/types/functions";

type PlayActionProps = {
  action: Functions.PlayActionState;
  setAction: Functions.SetAction<Functions.PlayActionState>;
};

export default function PlayAction(props: PlayActionProps) {
  return (
    <TrackDroppable
      parentId={props.action.id}
      index={0}
      trackExpression={props.action.trackExpression}
      setTrackExpression={(value) => {
        props.setAction((prevAction) => {
          const newAction = { ...prevAction };
          if (typeof value === "function") {
            const newTrackExpression = value(prevAction.trackExpression);
            newAction.trackExpression = newTrackExpression;
          } else {
            newAction.trackExpression = value;
          }
          return newAction;
        });
      }}
    />
  );
}
