"use client";

export function IntroSection() {
  return (
    <details open className="mx-auto max-w-[1600px] px-4 pt-4 sm:px-6 group">
      <summary className="cursor-pointer list-none rounded-2xl border border-amber-300/15 bg-gradient-to-br from-amber-300/[0.06] via-slate-950/40 to-slate-950/40 px-5 py-4 group-open:rounded-b-none group-open:border-b-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-300/70">From the book</p>
            <h2 className="mt-0.5 text-lg font-bold text-white">On Growth and Form, made interactive</h2>
          </div>
          <span className="shrink-0 text-xs font-semibold text-amber-200/70 transition group-open:hidden">Read more ⌄</span>
          <span className="hidden shrink-0 text-xs font-semibold text-amber-200/70 transition group-open:inline">Collapse ⌃</span>
        </div>
      </summary>
      <div className="rounded-b-2xl border border-t-0 border-amber-300/15 bg-slate-950/40 px-5 py-4">
        <p className="max-w-3xl text-sm leading-6 text-slate-300">
          In 1917, the Scottish biologist and mathematician D&rsquo;Arcy Wentworth Thompson published{" "}
          <em className="text-slate-200">On Growth and Form</em>, arguing that a living thing&rsquo;s shape owes as much
          to physics and mathematics as to natural selection — that a nautilus shell, a soap bubble, and a bee&rsquo;s
          honeycomb cell all obey the same geometric laws that shape non-living matter too.
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
          The <span className="font-semibold text-amber-200">Growth &amp; Form</span> section below turns sixteen of the
          book&rsquo;s central ideas into things you can drag and watch respond — from the logarithmic spiral of a shell
          to the exact trimming angle that lets a bee&rsquo;s cell use the least wax. Every number is computed live from
          closed-form mathematics and verified against independent derivations; nothing here is illustrative or
          approximate.
        </p>
      </div>
    </details>
  );
}
