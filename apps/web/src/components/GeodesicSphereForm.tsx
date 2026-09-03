"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePlaygroundStore } from "@/store/playground-store";
import { useCallback, useEffect } from "react";
import { FormActions, Vec2Fields } from "@/components/GeometryFields";

const formSchema = z.object({
  detail: z.object({
    x: z.coerce.number({ error: "Enter a number" }).finite(),
    y: z.coerce.number({ error: "Enter a number" }).finite(),
  }),
});

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

export function GeodesicSphereForm() {
  const {
    geodesicDetail,
    setGeodesicInput,
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
    defaultValues: { detail: geodesicDetail },
  });

  useEffect(() => {
    reset({ detail: geodesicDetail });
  }, [geodesicDetail, reset]);

  const onSubmit = useCallback(
    (values: FormValues) => {
      setQueryStatus("running");
      setGeodesicInput({ ...values.detail, z: 0 });
    },
    [setGeodesicInput, setQueryStatus]
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
        <Vec2Fields register={register} prefix="detail" label="Subdivision level (F)" symbol={objectLabels.geodesicDetail} errors={errors.detail} />
      </div>
      <p className="text-xs leading-5 text-slate-500">F&rsquo;s distance from the origin is rounded to the nearest whole subdivision level, 0–6.</p>
      <FormActions isSubmitting={isSubmitting} label="Rebuild the lattice" />
    </form>
  );
}
