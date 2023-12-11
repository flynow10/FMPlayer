import NumberDroppable from "@/src/components/functions/droppables/NumberDroppable";
import { Functions } from "@/src/types/functions";

type LoopActionProps = {
  action: Functions.LoopActionState;
  setAction: Functions.SetAction<Functions.LoopActionState>;
};

export default function LoopAction(props: LoopActionProps) {
  return (
    <NumberDroppable
      parentId={props.action.id}
      numberExpression={props.action.numberExpression}
      setNumberExpression={(value) => {
        props.setAction((prevAction) => {
          const newAction = { ...prevAction };
          if (typeof value === "function") {
            const newTrackExpression = value(prevAction.numberExpression);
            newAction.numberExpression = newTrackExpression;
          } else {
            newAction.numberExpression = value;
          }
          return newAction;
        });
      }}
    />
  );
}
