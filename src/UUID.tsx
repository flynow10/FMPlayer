import { useState } from "react";
import { v4 as uuidGen } from "uuid";

export function UUID() {
  const [uuid, setUuid] = useState(uuidGen());
  return (
    <div>
      <input readOnly value={uuid} style={{ width: 400 }} />
      <button
        onClick={() => {
          setUuid(uuidGen());
        }}
      >
        New UUID
      </button>
    </div>
  );
}
