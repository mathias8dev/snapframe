import { useEffect, useState } from "react";
import { isIdbUrl, loadImageAsObjectURL } from "./imageStore";

export function useLoadImage(url: string | null): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!url) {
      setImage(null);
      return;
    }

    let revoke: string | null = null;
    let cancelled = false;

    const load = async () => {
      let src = url;

      if (isIdbUrl(url)) {
        const objectUrl = await loadImageAsObjectURL(url);
        if (cancelled || !objectUrl) return;
        revoke = objectUrl;
        src = objectUrl;
      }

      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (!cancelled) setImage(img);
      };
      img.src = src;
    };

    load();

    return () => {
      cancelled = true;
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [url]);

  return image;
}
