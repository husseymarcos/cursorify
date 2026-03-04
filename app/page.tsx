"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HeroPanel } from "./components/HeroPanel";
import { UploaderPanel } from "./components/UploaderPanel";

type StylizedPoint = {
  x: number;
  y: number;
  radius: number;
  opacity: number;
};

const MAX_PREVIEW_SIZE = 480;
const GRID_SIZE = 80;
const BACKGROUND_COLOR = "#050505";
const FOREGROUND_COLOR = "#f5f5f5";

export default function Home() {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [points, setPoints] = useState<StylizedPoint[] | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  const handleFileChange = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!f.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setError(null);
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setObjectUrl(URL.createObjectURL(f));
    setPoints(null);
  }, [objectUrl]);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        handleFileChange(event.dataTransfer.files);
        event.dataTransfer.clearData();
      }
    },
    [handleFileChange],
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const generatePointsFromImage = useCallback(
    (img: HTMLImageElement) => {
      const offscreen = document.createElement("canvas");
      const ctx = offscreen.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

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

      const newPoints: StylizedPoint[] = [];

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
              rSum += data[idx];
              gSum += data[idx + 1];
              bSum += data[idx + 2];
              count++;
            }
          }

          if (count === 0) continue;
          const r = rSum / count;
          const g = gSum / count;
          const b = bSum / count;

          const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          const intensity = 1 - brightness;

          if (intensity < 0.12) continue;

          const jitterX = (Math.random() - 0.5) * cellW * 0.4;
          const jitterY = (Math.random() - 0.5) * cellH * 0.4;

          newPoints.push({
            x: (x + 0.5) * cellW + jitterX,
            y: (y + 0.5) * cellH + jitterY,
            radius: (Math.max(intensity, 0.15) * Math.min(cellW, cellH)) / 2.4,
            opacity: 0.35 + intensity * 0.65,
          });
        }
      }

      setDimensions({ width, height });
      setPoints(newPoints);
    },
    [],
  );

  useEffect(() => {
    if (!objectUrl) return;

    const img = new Image();

    img.onload = () => {
      generatePointsFromImage(img);
    };
    img.onerror = () => {
      setError("Could not read image. Try a different file.");
    };
    img.src = objectUrl;
  }, [objectUrl, generatePointsFromImage]);

  useEffect(() => {
    if (!canvasRef.current || !points || !dimensions) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = FOREGROUND_COLOR;

    for (const p of points) {
      ctx.globalAlpha = p.opacity;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }, [points, dimensions]);

  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "cursorified.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  }, []);

  const hasResult = !!points && !!dimensions;

  return (
    <div className="min-h-dvh bg-black text-zinc-100">
      <main className="mx-auto grid min-h-dvh max-w-6xl grid-cols-1 gap-10 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[1.1fr_minmax(0,1.4fr)] lg:items-center lg:py-16">
        <HeroPanel error={error} />

        <UploaderPanel
          objectUrl={objectUrl}
          hasResult={hasResult}
          canvasRef={canvasRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onFileChange={handleFileChange}
          onClear={() => {
            setPoints(null);
            setDimensions(null);
            setError(null);
            if (objectUrl) {
              URL.revokeObjectURL(objectUrl);
              setObjectUrl(null);
            }
          }}
          onDownload={handleDownload}
        />
      </main>
    </div>
  );
}
