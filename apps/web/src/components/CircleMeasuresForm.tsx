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

const formSchema = z.object({ radius: vec2Schema, angle: vec2Schema });

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

export function CircleMeasuresForm() {
  const {
    circleRadius,
    circleAngle,
    setCircleMeasuresInputs,
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
    defaultValues: { radius: circleRadius, angle: circleAngle },
  });

  useEffect(() => {
    reset({ radius: circleRadius, angle: circleAngle });
  }, [circleRadius, circleAngle, reset]);

  const onSubmit = useCallback(
    (values: FormValues) => {
      setQueryStatus("running");
      setCircleMeasuresInputs({ radiusPoint: { ...values.radius, z: 0 }, anglePoint: { ...values.angle, z: 0 } });
    },
    [setCircleMeasuresInputs, setQueryStatus]
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
        <Vec2Fields register={register} prefix="radius" label="Radius (R)" symbol={objectLabels.circleRadius} errors={errors.radius} />
        <Vec2Fields register={register} prefix="angle" label="Central angle direction" symbol={objectLabels.circleAngle} errors={errors.angle} />
      </div>
      <p className="text-xs leading-5 text-slate-500">R&rsquo;s distance from the origin sets the radius; the angle direction sweeps the sector counterclockwise from due east.</p>
      <FormActions isSubmitting={isSubmitting} label="Recompute the circle" />
    </form>
  );
}
