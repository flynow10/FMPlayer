import NumberDroppable from "@/src/components/functions/droppables/NumberDroppable";

import { checkActionParams } from "@/src/music/functions/utils/check-action-params";
import { Functions } from "@/src/types/functions";

type LoopActionProps = {
  action: Functions.ActionState;
  inToolBox: boolean;
  clone: boolean;
  setAction: Functions.SetAction<Functions.ActionState>;
};

export default function LoopAction(props: LoopActionProps) {
  checkActionParams(props.action, 0, 1, true);
  return (
    <NumberDroppable
      parentId={props.action.id}
      numberExpression={props.action.numberExpressions[0] ?? null}
      clone={props.clone}
      inToolBox={props.inToolBox}
      setNumberExpression={(value) => {
        props.setAction((prevAction) => {
          const newAction = { ...prevAction };
          let newValue: Functions.ActionState | null = null;
          if (typeof value === "function") {
            const newTrackExpression = value(prevAction.numberExpressions[0]);
            newValue = newTrackExpression;
          } else {
            newValue = value;
          }
          if (newValue === null) {
            newAction.numberExpressions[0] = null;
          } else {
            newAction.numberExpressions[0] = newValue;
          }
          return newAction;
        });
      }}
    />
  );
}
