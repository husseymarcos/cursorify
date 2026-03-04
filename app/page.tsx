"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HeroPanel } from "./components/HeroPanel";
import { UploaderPanel } from "./components/UploaderPanel";
import {
  generateStylizedPoints,
  type StylizedPoint,
} from "./lib/transform";
const BACKGROUND_COLOR = "#050505";
const FOREGROUND_COLOR = "#f5f5f5";

export default function Home() {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [originalName, setOriginalName] = useState<string | null>(null);
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

  const handleFileChange = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const f = files[0];
      if (!f.type.startsWith("image/")) {
        setError("Please choose an image file.");
        return;
      }
      setError(null);
      setOriginalName(f.name);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setObjectUrl(URL.createObjectURL(f));
      setPoints(null);
    },
    [objectUrl],
  );

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

  useEffect(() => {
    if (!objectUrl) return;

    const img = new Image();

    img.onload = () => {
      const { points: newPoints, width, height } = generateStylizedPoints(img);
      if (!newPoints.length) {
        setError("Could not generate stylized pixels from this image.");
        return;
      }
      setDimensions({ width, height });
      setPoints(newPoints);
    };
    img.onerror = () => {
      setError("Could not read image. Try a different file.");
    };
    img.src = objectUrl;
  }, [objectUrl]);

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

    if (originalName) {
      const lastDot = originalName.lastIndexOf(".");
      const base =
        lastDot > 0 ? originalName.slice(0, lastDot) : originalName;
      const ext =
        lastDot > 0 ? originalName.slice(lastDot) : ".png";
      link.download = `${base}-cursorified${ext}`;
    } else {
      link.download = "cursorified.png";
    }

    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  }, [originalName]);

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
            setOriginalName(null);
          }}
          onDownload={handleDownload}
        />
      </main>
    </div>
  );
}
