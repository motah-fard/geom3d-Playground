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

const formSchema = z.object({ translation: vec2Schema, handle: vec2Schema });

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

export function TransformationsForm() {
  const {
    transformTranslation,
    transformHandle,
    setTransformationsInputs,
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
    defaultValues: { translation: transformTranslation, handle: transformHandle },
  });

  useEffect(() => {
    reset({ translation: transformTranslation, handle: transformHandle });
  }, [transformTranslation, transformHandle, reset]);

  const onSubmit = useCallback(
    (values: FormValues) => {
      setQueryStatus("running");
      setTransformationsInputs({ translationPoint: { ...values.translation, z: 0 }, handlePoint: { ...values.handle, z: 0 } });
    },
    [setTransformationsInputs, setQueryStatus]
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
        <Vec2Fields register={register} prefix="translation" label="Translation (T)" symbol={objectLabels.transformTranslation} errors={errors.translation} />
        <Vec2Fields register={register} prefix="handle" label="Rotate + scale handle (H)" symbol={objectLabels.transformHandle} errors={errors.handle} />
      </div>
      <p className="text-xs leading-5 text-slate-500">T moves the triangle directly; H&rsquo;s angle from the origin sets the rotation, and its distance (relative to 2 units) sets the scale.</p>
      <FormActions isSubmitting={isSubmitting} label="Recompute the transform" />
    </form>
  );
}
