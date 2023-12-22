import React from "react";

type ActionListProps = {
  children?: React.ReactNode;
};

export default function ActionList({ children }: ActionListProps) {
  return (
    <div className="flex flex-col grow shrink-0 gap-2 p-2 overflow-auto">
      {children}
    </div>
  );
}
