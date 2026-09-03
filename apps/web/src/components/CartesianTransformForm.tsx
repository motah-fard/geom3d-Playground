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
  p00: vec2Schema,
  p10: vec2Schema,
  p01: vec2Schema,
  p11: vec2Schema,
});

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

export function CartesianTransformForm() {
  const {
    transformP00,
    transformP10,
    transformP01,
    transformP11,
    setTransformInputs,
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
      p00: transformP00,
      p10: transformP10,
      p01: transformP01,
      p11: transformP11,
    },
  });

  useEffect(() => {
    reset({
      p00: transformP00,
      p10: transformP10,
      p01: transformP01,
      p11: transformP11,
    });
  }, [transformP00, transformP10, transformP01, transformP11, reset]);

  const onSubmit = useCallback(
    (values: FormValues) => {
      setQueryStatus("running");
      setTransformInputs({
        p00: { ...values.p00, z: 0 },
        p10: { ...values.p10, z: 0 },
        p01: { ...values.p01, z: 0 },
        p11: { ...values.p11, z: 0 },
      });
    },
    [setTransformInputs, setQueryStatus]
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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Vec2Fields register={register} prefix="p00" label="Bottom-left" symbol={objectLabels.transformP00} errors={errors.p00} />
        <Vec2Fields register={register} prefix="p10" label="Bottom-right" symbol={objectLabels.transformP10} errors={errors.p10} />
        <Vec2Fields register={register} prefix="p01" label="Top-left" symbol={objectLabels.transformP01} errors={errors.p01} />
        <Vec2Fields register={register} prefix="p11" label="Top-right" symbol={objectLabels.transformP11} errors={errors.p11} />
      </div>
      <FormActions isSubmitting={isSubmitting} label="Warp the grid" />
    </form>
  );
}
