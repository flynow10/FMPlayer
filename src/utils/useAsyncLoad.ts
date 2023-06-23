import { SetStateAction, useEffect, useState } from "react";

export function useAsyncLoad<T>(
  load: () => Promise<T>,
  initialValue: T,
  deps?: React.DependencyList
): [T, boolean, React.Dispatch<SetStateAction<T>>] {
  const [data, setData] = useState<T>(initialValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    setLoaded(false);
    internalLoad();
    return () => {
      active = false;
    };

    async function internalLoad() {
      const newData = await load();
      if (active) {
        setLoaded(true);
        setData(newData);
      }
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return [data, loaded, setData];
}
