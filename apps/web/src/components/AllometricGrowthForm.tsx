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
  size: vec2Schema,
  exponent: vec2Schema,
});

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

export function AllometricGrowthForm() {
  const {
    allometrySize,
    allometryExponent,
    setAllometryInputs,
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
    defaultValues: { size: allometrySize, exponent: allometryExponent },
  });

  useEffect(() => {
    reset({ size: allometrySize, exponent: allometryExponent });
  }, [allometrySize, allometryExponent, reset]);

  const onSubmit = useCallback(
    (values: FormValues) => {
      setQueryStatus("running");
      setAllometryInputs({
        sizePoint: { ...values.size, z: 0 },
        exponentPoint: { ...values.exponent, z: 0 },
      });
    },
    [setAllometryInputs, setQueryStatus]
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
        <Vec2Fields register={register} prefix="size" label="Body size (x)" symbol={objectLabels.allometrySize} errors={errors.size} />
        <Vec2Fields register={register} prefix="exponent" label="Allometric exponent (k)" symbol={objectLabels.allometryExponent} errors={errors.exponent} />
      </div>
      <p className="text-xs leading-5 text-slate-500">The part&rsquo;s size is x^k. k = 1 keeps the same shape at every size; k ≠ 1 means the part&rsquo;s share of the whole changes as the body grows.</p>
      <FormActions isSubmitting={isSubmitting} label="Recompute growth" />
    </form>
  );
}
