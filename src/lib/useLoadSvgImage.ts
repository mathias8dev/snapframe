import { useEffect, useState } from "react";
import { tintSvg, svgToDataUrl } from "./iconUtils";

export function useLoadSvgImage(
  svgContent: string,
  fill: string,
): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!svgContent) {
      setImage(null);
      return;
    }

    const tinted = tintSvg(svgContent, fill);
    const img = new window.Image();
    img.onload = () => setImage(img);
    img.src = svgToDataUrl(tinted);
  }, [svgContent, fill]);

  return image;
}
