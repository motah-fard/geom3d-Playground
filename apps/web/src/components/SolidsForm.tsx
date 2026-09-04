"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePlaygroundStore } from "@/store/playground-store";
import { useCallback, useEffect } from "react";
import { FormActions, Vec2Fields } from "@/components/GeometryFields";
import type { SolidType } from "@/types/geometry";

const vec2Schema = z.object({
  x: z.coerce.number({ error: "Enter a number" }).finite(),
  y: z.coerce.number({ error: "Enter a number" }).finite(),
});

const formSchema = z.object({ dimA: vec2Schema, dimB: vec2Schema, dimC: vec2Schema });

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

const SOLID_OPTIONS: { value: SolidType; label: string }[] = [
  { value: "cube", label: "Cube" },
  { value: "box", label: "Rectangular prism" },
  { value: "cylinder", label: "Cylinder" },
  { value: "cone", label: "Cone" },
  { value: "sphere", label: "Sphere" },
  { value: "pyramid", label: "Square pyramid" },
];

const DIM_LABELS: Record<SolidType, { a: string; b?: string; c?: string }> = {
  cube: { a: "Side length (A)" },
  box: { a: "Length (A)", b: "Width (B)", c: "Height (C)" },
  cylinder: { a: "Radius (A)", b: "Height (B)" },
  cone: { a: "Radius (A)", b: "Height (B)" },
  sphere: { a: "Radius (A)" },
  pyramid: { a: "Base side (A)", b: "Height (B)" },
};

export function SolidsForm() {
  const {
    solidType,
    setSolidType,
    solidDimA,
    solidDimB,
    solidDimC,
    setSolidInputs,
    shouldAutoRun,
    setShouldAutoRun,
    setQueryStatus,
    saveCheckpoint,
    objectLabels,
  } = usePlaygroundStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { dimA: solidDimA, dimB: solidDimB, dimC: solidDimC },
  });

  useEffect(() => {
    reset({ dimA: solidDimA, dimB: solidDimB, dimC: solidDimC });
  }, [solidDimA, solidDimB, solidDimC, reset]);

  const onSubmit = useCallback(
    (values: FormValues) => {
      setQueryStatus("running");
      setSolidInputs({ dimA: { ...values.dimA, z: 0 }, dimB: { ...values.dimB, z: 0 }, dimC: { ...values.dimC, z: 0 } });
    },
    [setSolidInputs, setQueryStatus]
  );

  useEffect(() => {
    if (!shouldAutoRun) return;
    const timer = window.setTimeout(() => {
      setShouldAutoRun(false);
      handleSubmit(onSubmit)();
    }, 140);
    return () => window.clearTimeout(timer);
  }, [shouldAutoRun, handleSubmit, onSubmit, setShouldAutoRun]);

  const dims = DIM_LABELS[solidType];

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-100">Solid</span>
        <select
          value={solidType}
          onChange={(event) => {
            saveCheckpoint();
            setSolidType(event.target.value as SolidType);
            setShouldAutoRun(true);
          }}
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
        >
          {SOLID_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>

      <form onSubmit={handleSubmit(onSubmit)} onSubmitCapture={saveCheckpoint} className="space-y-4" noValidate>
        <div className="grid gap-3 sm:grid-cols-2">
          <Vec2Fields register={register} prefix="dimA" label={dims.a} symbol={objectLabels.solidDimA} errors={errors.dimA} />
          {dims.b && <Vec2Fields register={register} prefix="dimB" label={dims.b} symbol={objectLabels.solidDimB} errors={errors.dimB} />}
          {dims.c && <Vec2Fields register={register} prefix="dimC" label={dims.c} symbol={objectLabels.solidDimC} errors={errors.dimC} />}
        </div>
        <p className="text-xs leading-5 text-slate-500">Only each point&rsquo;s distance from the origin matters, clamped between 0.3 and 3 units.</p>
        <FormActions isSubmitting={isSubmitting} label="Recompute the solid" />
      </form>
    </div>
  );
}
