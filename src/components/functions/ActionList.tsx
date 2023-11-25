import React from "react";

type ActionListProps = {
  children?: React.ReactNode;
};

export default function ActionList({ children }: ActionListProps) {
  return (
    <div className="flex grow flex-col gap-2 p-2 h-full overflow-auto">
      {children}
    </div>
  );
}
