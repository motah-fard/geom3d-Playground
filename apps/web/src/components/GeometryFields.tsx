"use client";

import type { FieldPath, FieldValues, UseFormRegister } from "react-hook-form";

type Axis = "x" | "y" | "z";
export type Vec3Errors = Partial<Record<Axis, { message?: string }>>;

const axisStyles: Record<Axis, string> = {
  x: "text-rose-300 bg-rose-400/10 border-rose-400/20",
  y: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
  z: "text-sky-300 bg-sky-400/10 border-sky-400/20",
};

export function GeometryFields<TValues extends FieldValues>({
  register,
  prefix,
  label,
  symbol,
  hint,
  errors,
}: {
  register: UseFormRegister<TValues>;
  prefix: string;
  label: string;
  symbol?: string;
  hint?: string;
  errors?: Vec3Errors;
}) {
  const axes: Axis[] = ["x", "y", "z"];

  return (
    <fieldset className="rounded-xl border border-slate-700/70 bg-slate-900/45 p-3">
      <legend className="px-1 text-sm font-semibold text-slate-100">
        {symbol && (
          <span className="mr-2 inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-slate-700 px-1.5 font-mono text-[11px] text-white">
            {symbol}
          </span>
        )}
        {label}
      </legend>
      {hint && <p className="mb-2 text-xs leading-5 text-slate-400">{hint}</p>}
      <div className="grid grid-cols-3 gap-2">
        {axes.map((axis) => {
          const error = errors?.[axis]?.message;
          const id = `${prefix}-${axis}`;
          return (
            <label key={axis} htmlFor={id} className="min-w-0">
              <span className={`mb-1 inline-flex rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase ${axisStyles[axis]}`}>
                {axis}
              </span>
              <input
                id={id}
                type="number"
                step="any"
                inputMode="decimal"
                aria-label={`${label} ${axis.toUpperCase()} coordinate`}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
                {...register(`${prefix}.${axis}` as FieldPath<TValues>)}
                className="w-full min-w-0 rounded-lg border border-slate-700 bg-slate-950/70 px-2.5 py-2 font-mono text-sm text-slate-100 outline-none transition hover:border-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 aria-[invalid=true]:border-rose-400"
              />
              {error && <span id={`${id}-error`} className="mt-1 block text-[11px] text-rose-300">{error}</span>}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function FormActions({ isSubmitting, label }: { isSubmitting: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-[0_10px_30px_rgba(34,211,238,0.12)] transition hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-wait disabled:opacity-60"
    >
      {isSubmitting && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-900/30 border-t-slate-900" />}
      {isSubmitting ? "Computing…" : label}
    </button>
  );
}
