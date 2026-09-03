"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePlaygroundStore } from "@/store/playground-store";
import { useCallback, useEffect } from "react";
import { FormActions, Vec2Fields } from "@/components/GeometryFields";

const formSchema = z.object({
  count: z.object({
    x: z.coerce.number({ error: "Enter a number" }).finite(),
    y: z.coerce.number({ error: "Enter a number" }).finite(),
  }),
});

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

export function WhirlingSquaresForm() {
  const {
    whirlingCount,
    setWhirlingInput,
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
    defaultValues: { count: whirlingCount },
  });

  useEffect(() => {
    reset({ count: whirlingCount });
  }, [whirlingCount, reset]);

  const onSubmit = useCallback(
    (values: FormValues) => {
      setQueryStatus("running");
      setWhirlingInput({ ...values.count, z: 0 });
    },
    [setWhirlingInput, setQueryStatus]
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
        <Vec2Fields register={register} prefix="count" label="Square count (N)" symbol={objectLabels.whirlingCount} errors={errors.count} />
      </div>
      <p className="text-xs leading-5 text-slate-500">N&rsquo;s distance from the origin is rounded to the nearest whole number of squares, 1–14.</p>
      <FormActions isSubmitting={isSubmitting} label="Rebuild the sequence" />
    </form>
  );
}
