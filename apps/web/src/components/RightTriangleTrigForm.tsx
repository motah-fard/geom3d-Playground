"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePlaygroundStore } from "@/store/playground-store";
import { useCallback, useEffect } from "react";
import { FormActions, Vec2Fields } from "@/components/GeometryFields";

const formSchema = z.object({
  angle: z.object({
    x: z.coerce.number({ error: "Enter a number" }).finite(),
    y: z.coerce.number({ error: "Enter a number" }).finite(),
  }),
});

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

export function RightTriangleTrigForm() {
  const {
    trigAngle,
    setRightTriangleTrigInput,
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
    defaultValues: { angle: trigAngle },
  });

  useEffect(() => {
    reset({ angle: trigAngle });
  }, [trigAngle, reset]);

  const onSubmit = useCallback(
    (values: FormValues) => {
      setQueryStatus("running");
      setRightTriangleTrigInput({ ...values.angle, z: 0 });
    },
    [setRightTriangleTrigInput, setQueryStatus]
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
        <Vec2Fields register={register} prefix="angle" label="Angle θ direction" symbol={objectLabels.trigAngle} errors={errors.angle} />
      </div>
      <p className="text-xs leading-5 text-slate-500">The hypotenuse is fixed at length 3; only θ&rsquo;s direction from the origin matters, clamped between 1° and 89°.</p>
      <FormActions isSubmitting={isSubmitting} label="Recompute the triangle" />
    </form>
  );
}
