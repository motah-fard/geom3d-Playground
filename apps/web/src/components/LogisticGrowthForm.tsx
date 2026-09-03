"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePlaygroundStore } from "@/store/playground-store";
import { useCallback, useEffect } from "react";
import { FormActions, Vec2Fields } from "@/components/GeometryFields";
import { LOGISTIC_TIME_SPAN } from "@/lib/local-geometry";

const vec2Schema = z.object({
  x: z.coerce.number({ error: "Enter a number" }).finite(),
  y: z.coerce.number({ error: "Enter a number" }).finite(),
});

const formSchema = z.object({
  r: vec2Schema,
  k: vec2Schema,
});

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

export function LogisticGrowthForm() {
  const {
    logisticR,
    logisticK,
    setLogisticInputs,
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
    defaultValues: { r: logisticR, k: logisticK },
  });

  useEffect(() => {
    reset({ r: logisticR, k: logisticK });
  }, [logisticR, logisticK, reset]);

  const onSubmit = useCallback(
    (values: FormValues) => {
      setQueryStatus("running");
      setLogisticInputs({
        rPoint: { ...values.r, z: 0 },
        kPoint: { x: LOGISTIC_TIME_SPAN, y: values.k.y, z: 0 },
      });
    },
    [setLogisticInputs, setQueryStatus]
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
        <Vec2Fields register={register} prefix="r" label="Growth rate (r)" symbol={objectLabels.logisticR} errors={errors.r} />
        <Vec2Fields register={register} prefix="k" label="Ceiling (K)" symbol={objectLabels.logisticK} errors={errors.k} />
      </div>
      <p className="text-xs leading-5 text-slate-500">Only R&rsquo;s distance from the origin and K&rsquo;s height matter — K sits at the right edge of the fixed time window.</p>
      <FormActions isSubmitting={isSubmitting} label="Recompute the curve" />
    </form>
  );
}
