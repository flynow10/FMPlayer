import TrackDroppable from "@/src/components/functions/droppables/TrackDroppable";
import { checkActionParams } from "@/src/music/functions/utils/check-action-params";
import { Functions } from "@/src/types/functions";

type PlayActionProps = {
  action: Functions.ActionState;
  setAction: Functions.SetAction<Functions.ActionState>;
};

export default function PlayAction(props: PlayActionProps) {
  checkActionParams(props.action, 1, 0, false);
  return (
    <TrackDroppable
      parentId={props.action.id}
      index={0}
      trackExpression={props.action.trackExpressions[0] ?? null}
      setTrackExpression={(value) => {
        props.setAction((prevAction) => {
          const newAction = { ...prevAction };
          let newValue: Functions.ActionState | null = null;
          if (typeof value === "function") {
            const newTrackExpression = value(prevAction.trackExpressions[0]);
            newValue = newTrackExpression;
          } else {
            newValue = value;
          }
          if (newValue === null) {
            newAction.trackExpressions[0] = null;
          } else {
            newAction.trackExpressions[0] = newValue;
          }
          return newAction;
        });
      }}
    />
  );
}
