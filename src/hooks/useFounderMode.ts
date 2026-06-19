import { useEffect, useState } from "react";
import { disableFounderMode, isFounderModeEnabled, unlockFounderMode } from "../lib/founderMode";

type FounderModeState = {
  founderMode: boolean;
  enableFounderMode: (code: string) => boolean;
  disableFounder: () => void;
};

export function useFounderMode(): FounderModeState {
  const [founderMode, setFounderMode] = useState(() => isFounderModeEnabled());

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get("founder");

    if (!codeFromUrl) return;

    const unlocked = unlockFounderMode(codeFromUrl);

    if (unlocked) {
      setFounderMode(true);

      const url = new URL(window.location.href);
      url.searchParams.delete("founder");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  function enableFounderMode(code: string): boolean {
    const unlocked = unlockFounderMode(code);

    if (unlocked) {
      setFounderMode(true);
    }

    return unlocked;
  }

  function disableFounder(): void {
    disableFounderMode();
    setFounderMode(false);
  }

  return {
    founderMode,
    enableFounderMode,
    disableFounder,
  };
}
