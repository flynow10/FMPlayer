import { useEffect, useState } from "react";

import { RealtimeStatus } from "@/src/api/ably-client";

import { Types } from "ably";
import { Server, ServerCog, ServerOff } from "lucide-react";

type StatusSymbol = "server" | "server-off" | "server-cog";

export default function AblyStatusSymbol() {
  const [statusSymbol, setStatusSymbol] = useState<StatusSymbol>("server-off");

  useEffect(() => {
    const handleStateChange = (stateChange: Types.ConnectionStateChange) => {
      switch (stateChange.current) {
        case "connected": {
          setStatusSymbol("server");
          break;
        }
        case "initialized":
        case "closing":
        case "connecting": {
          setStatusSymbol("server-cog");
          break;
        }
        case "closed":
        case "disconnected":
        case "failed":
        case "suspended": {
          setStatusSymbol("server-off");
          break;
        }
      }
    };
    handleStateChange({
      current: RealtimeStatus.stateManager.state,
      previous: "initialized",
    });
    RealtimeStatus.stateManager.subscribe(handleStateChange);
    return () => {
      RealtimeStatus.stateManager.unsubscribe(handleStateChange);
    };
  }, []);
  let component;

  switch (statusSymbol) {
    case "server": {
      component = <Server />;
      break;
    }
    case "server-cog": {
      component = <ServerCog />;
      break;
    }
    case "server-off": {
      component = <ServerOff />;
      break;
    }
  }
  return (
    <div title={`Ably Connection Status: ${RealtimeStatus.stateManager.state}`}>
      {component}
    </div>
  );
}
