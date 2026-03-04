export type StylizedPoint = {
  x: number;
  y: number;
  radius: number;
  opacity: number;
};

const MAX_PREVIEW_SIZE = 560;
const GRID_SIZE = 112;

export function generateStylizedPoints(img: HTMLImageElement): {
  points: StylizedPoint[];
  width: number;
  height: number;
} {
  const offscreen = document.createElement("canvas");
  const ctx = offscreen.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return { points: [], width: 0, height: 0 };
  }

  const scale =
    img.width > img.height
      ? MAX_PREVIEW_SIZE / img.width
      : MAX_PREVIEW_SIZE / img.height;

  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  offscreen.width = width;
  offscreen.height = height;

  ctx.drawImage(img, 0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const cols = GRID_SIZE;
  const rows = Math.round((GRID_SIZE * height) / width);

  const cellW = width / cols;
  const cellH = height / rows;

  const intensities: number[] = new Array(rows * cols);
  let minI = 1;
  let maxI = 0;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      let count = 0;

      const startX = Math.floor(x * cellW);
      const startY = Math.floor(y * cellH);
      const endX = Math.min(Math.floor((x + 1) * cellW), width);
      const endY = Math.min(Math.floor((y + 1) * cellH), height);

      for (let py = startY; py < endY; py++) {
        for (let px = startX; px < endX; px++) {
          const idx = (py * width + px) * 4;
          rSum += (data[idx] ?? 0);
          gSum += (data[idx + 1] ?? 0);
          bSum += (data[idx + 2] ?? 0);
          count++;
        }
      }

      if (count === 0) {
        intensities[y * cols + x] = 0;
        continue;
      }

      const r = rSum / count;
      const g = gSum / count;
      const b = bSum / count;

      const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      let intensity = 1 - brightness;

      intensity = Math.pow(intensity, 1.1);

      intensities[y * cols + x] = intensity;
      if (intensity < minI) minI = intensity;
      if (intensity > maxI) maxI = intensity;
    }
  }

  const range = Math.max(maxI - minI, 1e-3);

  const points: StylizedPoint[] = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const raw = intensities[y * cols + x];
      if (raw <= 0) continue;

      const normalized = (raw - minI) / range;
      if (normalized < 0.08) continue;

      const jitterX = (Math.random() - 0.5) * cellW * 0.2;
      const jitterY = (Math.random() - 0.5) * cellH * 0.2;

      const baseSize = Math.min(cellW, cellH);
      const radius = (0.12 + normalized * 0.88) * (baseSize / 2.2);

      points.push({
        x: (x + 0.5) * cellW + jitterX,
        y: (y + 0.5) * cellH + jitterY,
        radius,
        opacity: 0.35 + normalized * 0.6,
      });
    }
  }

  return { points, width, height };
}

