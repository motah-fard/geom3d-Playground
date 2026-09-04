"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePlaygroundStore } from "@/store/playground-store";
import { useCallback, useEffect } from "react";
import { FormActions, Vec2Fields } from "@/components/GeometryFields";

const formSchema = z.object({
  b: z.object({
    x: z.coerce.number({ error: "Enter a number" }).finite(),
    y: z.coerce.number({ error: "Enter a number" }).finite(),
  }),
});

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

export function AnglesForm() {
  const {
    angleRayB,
    setAngleInput,
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
    defaultValues: { b: angleRayB },
  });

  useEffect(() => {
    reset({ b: angleRayB });
  }, [angleRayB, reset]);

  const onSubmit = useCallback(
    (values: FormValues) => {
      setQueryStatus("running");
      setAngleInput({ ...values.b, z: 0 });
    },
    [setAngleInput, setQueryStatus]
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
        <Vec2Fields register={register} prefix="b" label="Ray B direction" symbol={objectLabels.angleRayB} errors={errors.b} />
      </div>
      <p className="text-xs leading-5 text-slate-500">Ray A is fixed along the positive X axis; only B&rsquo;s direction from the vertex matters.</p>
      <FormActions isSubmitting={isSubmitting} label="Recompute the angle" />
    </form>
  );
}
