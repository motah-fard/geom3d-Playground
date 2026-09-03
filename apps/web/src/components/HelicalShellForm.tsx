"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePlaygroundStore } from "@/store/playground-store";
import { useCallback, useEffect } from "react";
import { FormActions, GeometryFields, Vec2Fields } from "@/components/GeometryFields";

const formSchema = z.object({
  start: z.object({
    x: z.coerce.number({ error: "Enter a number" }).finite(),
    y: z.coerce.number({ error: "Enter a number" }).finite(),
  }),
  turn: z.object({
    x: z.coerce.number({ error: "Enter a number" }).finite(),
    y: z.coerce.number({ error: "Enter a number" }).finite(),
    z: z.coerce.number({ error: "Enter a number" }).finite(),
  }),
});

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

export function HelicalShellForm() {
  const {
    helixStart,
    helixTurn,
    setHelixInputs,
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
      start: { x: helixStart.x, y: helixStart.y },
      turn: helixTurn,
    },
  });

  useEffect(() => {
    reset({ start: { x: helixStart.x, y: helixStart.y }, turn: helixTurn });
  }, [helixStart, helixTurn, reset]);

  const onSubmit = useCallback(
    (values: FormValues) => {
      setQueryStatus("running");
      setHelixInputs({
        start: { ...values.start, z: 0 },
        turn: values.turn,
      });
    },
    [setHelixInputs, setQueryStatus]
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
        <Vec2Fields register={register} prefix="start" label="Base radius (θ = 0)" symbol={objectLabels.helixStart} errors={errors.start} />
        <GeometryFields register={register} prefix="turn" label="Radius and rise after one turn" symbol={objectLabels.helixTurn} errors={errors.turn} />
      </div>
      <p className="text-xs leading-5 text-slate-500">Only T&rsquo;s distance from the axis (x, y) and its height (z) matter — z is the total rise after one full turn.</p>
      <FormActions isSubmitting={isSubmitting} label="Grow the shell" />
    </form>
  );
}
