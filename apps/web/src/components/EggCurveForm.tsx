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
  big: vec2Schema,
  small: vec2Schema,
});

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

export function EggCurveForm() {
  const {
    eggBig,
    eggSmall,
    setEggCurveInputs,
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
    defaultValues: { big: eggBig, small: eggSmall },
  });

  useEffect(() => {
    reset({ big: eggBig, small: eggSmall });
  }, [eggBig, eggSmall, reset]);

  const onSubmit = useCallback(
    (values: FormValues) => {
      setQueryStatus("running");
      setEggCurveInputs({
        bigPoint: { ...values.big, z: 0 },
        smallPoint: { ...values.small, z: 0 },
      });
    },
    [setEggCurveInputs, setQueryStatus]
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
        <Vec2Fields register={register} prefix="big" label="Round end radius (R)" symbol={objectLabels.eggBig} errors={errors.big} />
        <Vec2Fields register={register} prefix="small" label="Pointed end radius (r)" symbol={objectLabels.eggSmall} errors={errors.small} />
      </div>
      <p className="text-xs leading-5 text-slate-500">The two circles sit a fixed distance apart; R need not stay larger than r — either way the tangent construction still closes into an egg.</p>
      <FormActions isSubmitting={isSubmitting} label="Rebuild the egg" />
    </form>
  );
}
