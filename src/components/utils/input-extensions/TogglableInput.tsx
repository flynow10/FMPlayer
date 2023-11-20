import { Edit } from "lucide-react";
import { useEffect, useState } from "react";

type TogglableInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "placeholder"
> & {
  containerProps?: React.HTMLAttributes<HTMLDivElement>;
  value: string;
  onChange: (newValue: string) => void;
  onToggleEdit?: (isEditing: boolean) => void;
  placeholder?: string;
};

export default function TogglableInput(props: TogglableInputProps) {
  const [editing, setEditing] = useState(false);

  const {
    value,
    containerProps,
    onChange,
    onToggleEdit,
    placeholder,
    ...inputProps
  } = props;

  useEffect(() => {
    onToggleEdit?.(editing);
  }, [editing, onToggleEdit]);

  return (
    <div className="flex gap-2" {...containerProps}>
      {editing ? (
        <input
          className="grow border-2 p-1 rounded-md"
          {...inputProps}
          placeholder={placeholder}
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          onBlur={() => {
            setEditing(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              setEditing(false);
            }
          }}
        />
      ) : (
        <span
          onClick={() => {
            setEditing(true);
          }}
          className={
            (inputProps.className ?? "grow p-1") +
            (value === "" ? " text-gray-400" : "")
          }
        >
          {value === "" ? placeholder : value}
        </span>
      )}
      <button
        className="hover:bg-gray-200 rounded-md p-1 ml-auto"
        onClick={() => {
          setEditing(!editing);
        }}
      >
        <Edit />
      </button>
    </div>
  );
}
