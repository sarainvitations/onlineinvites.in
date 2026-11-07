import { useLocation } from "react-router-dom";

/** Only allow the two in-app browsing pages as a demo's return destination. */
export function useDesignReturn(templateId: string) {
  const { state } = useLocation();
  const value: unknown = state?.designReturnTo;
  if (typeof value === "string") {
    try {
      const url = new URL(value, "https://onlineinvites.in");
      if (
        url.origin === "https://onlineinvites.in" &&
        ["/", "/designs"].includes(url.pathname)
      )
        return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      /* Direct preview links return to the gallery. */
    }
  }
  return `/designs?slide=${encodeURIComponent(templateId)}#design-carousel`;
}
