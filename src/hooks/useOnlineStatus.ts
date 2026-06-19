import { useEffect, useState } from "react";

export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() => window.navigator.onLine);

  useEffect(() => {
    const handleOnline = (): void => setOnline(true);
    const handleOffline = (): void => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return online;
}
