"use client";

import type { DragEventHandler, FC, RefObject } from "react";
import NextImage from "next/image";

type UploaderPanelProps = {
  objectUrl: string | null;
  hasResult: boolean;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  onDrop: DragEventHandler<HTMLDivElement>;
  onDragOver: DragEventHandler<HTMLDivElement>;
  onFileChange: (files: FileList | null) => void;
  onClear: () => void;
  onDownload: () => void;
};

export const UploaderPanel: FC<UploaderPanelProps> = ({
  objectUrl,
  hasResult,
  canvasRef,
  onDrop,
  onDragOver,
  onFileChange,
  onClear,
  onDownload,
}) => {
  return (
    <section className="mt-4 flex flex-1 flex-col gap-4 md:mt-6">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        className="group relative flex aspect-4/5 w-full max-w-xl cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-zinc-800/90 bg-zinc-950/70 p-4 shadow-[0_0_160px_rgba(255,255,255,0.07)] transition-colors hover:border-zinc-400/70 sm:aspect-3/4 sm:max-w-2xl lg:aspect-4/3 lg:max-w-none"
        role="button"
        aria-label="Upload image"
        onClick={() => document.getElementById("cursorify-input")?.click()}
      >
        <input
          id="cursorify-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFileChange(e.target.files)}
        />

        {!objectUrl && (
          <div className="pointer-events-none flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-zinc-700 bg-zinc-900/80 text-zinc-400 transition-colors group-hover:border-zinc-400 group-hover:text-zinc-200">
              <span className="text-2xl">+</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-100">
                Drop an image here
              </p>
              <p className="text-xs text-zinc-500">
                or click to browse · PNG · JPG · up to ~10MB
              </p>
            </div>
          </div>
        )}

        {objectUrl && (
          <div className="grid h-full w-full grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="relative flex items-center justify-center overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/50">
              <NextImage
                src={objectUrl}
                alt="Original upload"
                fill
                className="object-contain"
                sizes="50vw"
              />
              <div className="pointer-events-none absolute inset-x-0 top-0 bg-linear-to-b from-black/40 via-transparent to-transparent" />
              <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/80 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-300">
                Original
              </span>
            </div>

            <div className="relative flex items-center justify-center overflow-hidden rounded-xl border border-zinc-800/80 bg-black">
              {hasResult ? (
                <>
                  <canvas
                    ref={canvasRef}
                    className="h-full w-full object-contain"
                  />
                  <div className="pointer-events-none absolute inset-x-0 top-0 bg-linear-to-b from-black/40 via-transparent to-transparent" />
                  <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/80 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-300">
                    Cursorified
                  </span>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-xs text-zinc-500">
                  <div className="h-7 w-7 animate-spin rounded-full border border-zinc-800 border-t-zinc-200" />
                  <span>Sampling pixels…</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white md:px-4 md:text-sm"
            onClick={onClear}
          >
            Clear
          </button>
          <button
            type="button"
            disabled={!hasResult}
            onClick={onDownload}
            className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-1.5 text-xs font-medium text-black transition-colors enabled:hover:bg-white disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300 md:px-5 md:text-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-black" />
            Download PNG
          </button>
        </div>
      </div>
    </section>
  );
};

