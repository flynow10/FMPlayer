import { useEffect, useState } from "react";

import { RealtimeStatus } from "@/src/api/ably-client";
import { useAsyncLoad } from "@/src/hooks/use-async-load";
import { Music } from "@/src/types/music";

export enum DataState {
  Loading,
  Loaded,
  Stale,
}

export function useDatabase<T>(
  load: () => Promise<T>,
  initialValue: T,
  tableNames: Music.DB.TableName | Music.DB.TableName[],
  deps?: React.DependencyList
): [T, DataState] {
  const [lastReloadTime, setLastReloadTime] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [data, isLoaded] = useAsyncLoad(
    async () => {
      const data = await load();
      setHasLoaded(true);
      return data;
    },
    initialValue,
    [lastReloadTime, ...(deps ?? [])]
  );

  useEffect(() => {
    const tableNamesArray =
      typeof tableNames === "string" ? [tableNames] : tableNames;
    const unsubscribe = RealtimeStatus.databaseUpdatesChannel.subscribe(
      (message) => {
        if (tableNamesArray.includes(message.model as Music.DB.TableName)) {
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
    !hasLoaded && !isLoaded
      ? DataState.Loading
      : isLoaded
      ? DataState.Loaded
      : DataState.Stale,
  ];
}
