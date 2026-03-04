import type { FC } from "react";

type HeroPanelProps = {
  error: string | null;
};

export const HeroPanel: FC<HeroPanelProps> = ({ error }) => {
  return (
    <section className="flex flex-1 flex-col justify-between gap-8 pt-4 md:pt-0">
      <header className="space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Cursorify your images into dense, cinematic grids.
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-zinc-400 md:text-base">
            Drop any photo and watch it dissolve into a high‑contrast constellation of dots,
            echoing the Cursor launch artwork. Perfect for wallpapers, posters, or just to stare at
            for a while.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-xs text-zinc-500 md:text-sm">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-linear-to-r from-zinc-800 via-zinc-700 to-zinc-900" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              HOW IT WORKS
            </span>
            <div className="h-px flex-1 bg-linear-to-l from-zinc-800 via-zinc-700 to-zinc-900" />
          </div>
          <ol className="grid gap-3 text-xs text-zinc-400 md:grid-cols-3 md:text-[13px]">
            <li className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-3 py-3">
              <span className="mb-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 text-[11px] font-semibold text-black">
                1
              </span>
              <p>Drop or pick any image file from your device.</p>
            </li>
            <li className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-3 py-3">
              <span className="mb-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 text-[11px] font-semibold text-black">
                2
              </span>
              <p>We sample its pixels into a jittered dot matrix with heavy contrast.</p>
            </li>
            <li className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-3 py-3">
              <span className="mb-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 text-[11px] font-semibold text-black">
                3
              </span>
              <p>Download the generated PNG and use it anywhere.</p>
            </li>
          </ol>
        </div>
      </header>

      {error && (
        <div className="mt-8 text-xs text-red-400 md:text-sm">{error}</div>
      )}
    </section>
  );
};

