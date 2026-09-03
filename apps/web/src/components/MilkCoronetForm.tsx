"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePlaygroundStore } from "@/store/playground-store";
import { useCallback, useEffect } from "react";
import { FormActions, Vec2Fields } from "@/components/GeometryFields";

const vec2Schema = z.object({
  x: z.coerce.number({ error: "Enter a number" }).finite(),
  y: z.coerce.number({ error: "Enter a number" }).finite(),
});

const formSchema = z.object({
  radius: vec2Schema,
  count: vec2Schema,
});

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

export function MilkCoronetForm() {
  const {
    milkRadius,
    milkCount,
    setMilkCoronetInputs,
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
    defaultValues: { radius: milkRadius, count: milkCount },
  });

  useEffect(() => {
    reset({ radius: milkRadius, count: milkCount });
  }, [milkRadius, milkCount, reset]);

  const onSubmit = useCallback(
    (values: FormValues) => {
      setQueryStatus("running");
      setMilkCoronetInputs({
        radiusPoint: { ...values.radius, z: 0 },
        countPoint: { ...values.count, z: 0 },
      });
    },
    [setMilkCoronetInputs, setQueryStatus]
  );

  // Auto-run when a drag (or an example) updates the inputs, reusing the
  // exact same submit path as a manual form submission rather than
  // duplicating the transform math and its state updates.
  useEffect(() => {
    if (!shouldAutoRun) return;

    const timer = window.setTimeout(() => {
      setShouldAutoRun(false);
      handleSubmit(onSubmit)();
    }, 140);
    return () => window.clearTimeout(timer);
  }, [shouldAutoRun, handleSubmit, onSubmit, setShouldAutoRun]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} onSubmitCapture={saveCheckpoint} className="space-y-4" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <Vec2Fields register={register} prefix="radius" label="Rim radius (R)" symbol={objectLabels.milkRadius} errors={errors.radius} />
        <Vec2Fields register={register} prefix="count" label="Crown points (N)" symbol={objectLabels.milkCount} errors={errors.count} />
      </div>
      <p className="text-xs leading-5 text-slate-500">Only each point&rsquo;s distance from the origin matters; N is rounded to the nearest whole point, 3–40.</p>
      <FormActions isSubmitting={isSubmitting} label="Rebuild the crown" />
    </form>
  );
}
