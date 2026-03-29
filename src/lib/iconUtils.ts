/** Apply a fill/stroke color to an SVG string by replacing currentColor. */
export function tintSvg(svgContent: string, color: string): string {
  return svgContent
    .replace(/stroke="currentColor"/g, `stroke="${color}"`)
    .replace(/fill="currentColor"/g, `fill="${color}"`);
}

/** Convert an SVG string to a data URL. */
export function svgToDataUrl(svgContent: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
}

/** Convert an SVG string to an HTMLImageElement (async). */
export function svgToImage(svgContent: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = svgToDataUrl(svgContent);
  });
}
