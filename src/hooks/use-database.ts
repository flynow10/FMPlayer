import { RealtimeStatus } from "@/src/api/ably-client";
import { useAsyncLoad } from "@/src/hooks/use-async-load";
import { Prisma } from "@prisma/client";
import { useEffect, useState } from "react";

export enum DataState {
  Loading,
  Loaded,
  Stale,
}

export function useDatabase<T>(
  load: () => Promise<T>,
  initialValue: T,
  tableNames: Prisma.ModelName | Prisma.ModelName[],
  deps?: React.DependencyList
): [T, DataState] {
  const [lastReloadTime, setLastReloadTime] = useState(0);
  const [data, isLoaded] = useAsyncLoad(load, initialValue, [
    lastReloadTime,
    ...(deps ?? []),
  ]);

  useEffect(() => {
    const tableNamesArray =
      typeof tableNames === "string" ? [tableNames] : tableNames;
    const unsubscribe = RealtimeStatus.databaseUpdatesChannel.subscribe(
      (message) => {
        if (tableNamesArray.includes(message.model as Prisma.ModelName)) {
          setLastReloadTime(message.timestamp);
        }
      },
      "status"
    );
    return () => {
      unsubscribe();
    };
  }, [tableNames]);

  return [
    data,
    lastReloadTime === 0 && !isLoaded
      ? DataState.Loading
      : isLoaded
      ? DataState.Loaded
      : DataState.Stale,
  ];
}
