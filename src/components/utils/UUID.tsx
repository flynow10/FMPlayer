import { useState } from "react";
import { v4 as uuidGen } from "uuid";

export function UUID() {
  const [uuid, setUuid] = useState(uuidGen());
  return (
    <div>
      <pre id="uuid" className="select-all inline-block mr-2">
        {uuid}
      </pre>
      <button
        className=" shadow-[0_0_4px_rgb(0,0,0,0.2)] rounded-md px-2"
        onClick={() => {
          setUuid(uuidGen());
        }}
      >
        New UUID
      </button>
    </div>
  );
}