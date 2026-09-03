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
  start: vec2Schema,
  turn: vec2Schema,
});

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

export function LogSpiralForm() {
  const {
    spiralStart,
    spiralTurn,
    setSpiralInputs,
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
    defaultValues: {
      start: spiralStart,
      turn: spiralTurn,
    },
  });

  useEffect(() => {
    reset({ start: spiralStart, turn: spiralTurn });
  }, [spiralStart, spiralTurn, reset]);

  const onSubmit = useCallback(
    (values: FormValues) => {
      setQueryStatus("running");
      setSpiralInputs({
        start: { ...values.start, z: 0 },
        turn: { ...values.turn, z: 0 },
      });
    },
    [setSpiralInputs, setQueryStatus]
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
        <Vec2Fields register={register} prefix="start" label="Start radius (θ = 0)" symbol={objectLabels.spiralStart} errors={errors.start} />
        <Vec2Fields register={register} prefix="turn" label="Radius after one turn (θ = 2π)" symbol={objectLabels.spiralTurn} errors={errors.turn} />
      </div>
      <p className="text-xs leading-5 text-slate-500">Only the distance from the origin matters for each point — the angle is ignored, and both are drawn on the positive X axis.</p>
      <FormActions isSubmitting={isSubmitting} label="Grow the spiral" />
    </form>
  );
}
