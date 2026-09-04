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

const formSchema = z.object({ tilt: vec2Schema, offset: vec2Schema });

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

export function CrossSectionForm() {
  const {
    crossSectionTilt,
    crossSectionOffset,
    setCrossSectionInputs,
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
    defaultValues: { tilt: crossSectionTilt, offset: crossSectionOffset },
  });

  useEffect(() => {
    reset({ tilt: crossSectionTilt, offset: crossSectionOffset });
  }, [crossSectionTilt, crossSectionOffset, reset]);

  const onSubmit = useCallback(
    (values: FormValues) => {
      setQueryStatus("running");
      setCrossSectionInputs({ tiltPoint: { ...values.tilt, z: 0 }, offsetPoint: { ...values.offset, z: 0 } });
    },
    [setCrossSectionInputs, setQueryStatus]
  );

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
        <Vec2Fields register={register} prefix="tilt" label="Cutting plane tilt" symbol={objectLabels.crossSectionTilt} errors={errors.tilt} />
        <Vec2Fields register={register} prefix="offset" label="Plane offset from apex" symbol={objectLabels.crossSectionOffset} errors={errors.offset} />
      </div>
      <p className="text-xs leading-5 text-slate-500">The tilt handle&rsquo;s angle from the origin sets the cutting angle; the offset point&rsquo;s distance sets how far up the axis the plane sits.</p>
      <FormActions isSubmitting={isSubmitting} label="Recompute the slice" />
    </form>
  );
}
