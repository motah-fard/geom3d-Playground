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

const formSchema = z.object({ a: vec2Schema, b: vec2Schema });

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

export function PythagoreanForm() {
  const {
    pythagoreanLegA,
    pythagoreanLegB,
    setPythagoreanInputs,
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
    defaultValues: { a: pythagoreanLegA, b: pythagoreanLegB },
  });

  useEffect(() => {
    reset({ a: pythagoreanLegA, b: pythagoreanLegB });
  }, [pythagoreanLegA, pythagoreanLegB, reset]);

  const onSubmit = useCallback(
    (values: FormValues) => {
      setQueryStatus("running");
      setPythagoreanInputs({ legAPoint: { ...values.a, z: 0 }, legBPoint: { ...values.b, z: 0 } });
    },
    [setPythagoreanInputs, setQueryStatus]
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
        <Vec2Fields register={register} prefix="a" label="Leg A" symbol={objectLabels.pythagoreanLegA} errors={errors.a} />
        <Vec2Fields register={register} prefix="b" label="Leg B" symbol={objectLabels.pythagoreanLegB} errors={errors.b} />
      </div>
      <p className="text-xs leading-5 text-slate-500">The right angle is fixed at the origin; only each leg&rsquo;s distance from it matters.</p>
      <FormActions isSubmitting={isSubmitting} label="Recompute the triangle" />
    </form>
  );
}
