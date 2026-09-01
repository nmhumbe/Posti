import { useEffect, useState } from "react";
import { photoBlobs } from "@core/db";

/** Resolves a photo blob key to an object URL, revoking it on cleanup. */
export function useBlobUrl(key: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let revoked = false;
    let objectUrl: string | null = null;
    if (!key) {
      setUrl(null);
      return;
    }
    photoBlobs.get(key).then((blob) => {
      if (revoked || !blob) return;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    });
    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [key]);

  return url;
}
