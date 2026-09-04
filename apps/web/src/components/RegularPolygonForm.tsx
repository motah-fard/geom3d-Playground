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

const formSchema = z.object({ sides: vec2Schema, radius: vec2Schema });

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

export function RegularPolygonForm() {
  const {
    polygonSides,
    polygonRadius,
    setRegularPolygonInputs,
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
    defaultValues: { sides: polygonSides, radius: polygonRadius },
  });

  useEffect(() => {
    reset({ sides: polygonSides, radius: polygonRadius });
  }, [polygonSides, polygonRadius, reset]);

  const onSubmit = useCallback(
    (values: FormValues) => {
      setQueryStatus("running");
      setRegularPolygonInputs({ sidesPoint: { ...values.sides, z: 0 }, radiusPoint: { ...values.radius, z: 0 } });
    },
    [setRegularPolygonInputs, setQueryStatus]
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
        <Vec2Fields register={register} prefix="sides" label="Side count (N)" symbol={objectLabels.polygonSides} errors={errors.sides} />
        <Vec2Fields register={register} prefix="radius" label="Circumradius (R)" symbol={objectLabels.polygonRadius} errors={errors.radius} />
      </div>
      <p className="text-xs leading-5 text-slate-500">N is rounded to the nearest whole side count, 3–20; R is the distance from the center to each vertex.</p>
      <FormActions isSubmitting={isSubmitting} label="Rebuild the polygon" />
    </form>
  );
}
