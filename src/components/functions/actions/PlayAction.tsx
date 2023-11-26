import TrackDroppable from "@/src/components/functions/droppables/TrackDroppable";
import { Functions } from "@/src/types/functions";

type PlayActionProps = {
  action: Functions.PlayActionState;
};

export default function PlayAction(props: PlayActionProps) {
  return (
    <TrackDroppable
      actionId={props.action.id}
      trackExpression={props.action.trackExpression}
    />
  );
}
