import { useEffect } from "react";

export function useHashChange(onHashChange: EventListener) {
  useEffect(() => {
    window.addEventListener("hashchange", onHashChange);

    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
}
