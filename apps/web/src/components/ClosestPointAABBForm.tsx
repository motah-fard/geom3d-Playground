"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { closestPointAABB, isAbortedRequest } from "@/lib/api";
import { usePlaygroundStore } from "@/store/playground-store";
import { useCallback, useEffect } from "react";
import { FormActions, GeometryFields } from "@/components/GeometryFields";

const vec3Schema = z.object({
  x: z.coerce.number({ error: "Enter a number" }).finite(),
  y: z.coerce.number({ error: "Enter a number" }).finite(),
  z: z.coerce.number({ error: "Enter a number" }).finite(),
});

const formSchema = z.object({
  point: vec3Schema,
  aabbMin: vec3Schema,
  aabbMax: vec3Schema,
}).refine(({ aabbMin, aabbMax }) => aabbMin.x <= aabbMax.x && aabbMin.y <= aabbMax.y && aabbMin.z <= aabbMax.z, { message: "Min must not exceed max", path: ["aabbMin", "x"] });

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

export function ClosestPointAABBForm() {
  const {
    point,
    aabbMin,
    aabbMax,
    setClosestPointAABBInputs,
    setClosestPointAABBResult,
    setError,
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
      point,
      aabbMin,
      aabbMax,
    },
  });

  useEffect(() => {
    reset({ point, aabbMin, aabbMax });
  }, [point, aabbMin, aabbMax, reset]);

  const onSubmit = useCallback(
    async (values: FormValues) => {
      setClosestPointAABBInputs(values);
      setError(null);
      setQueryStatus("running");

      try {
        const response = await closestPointAABB({
          point: values.point,
          aabb: { min: values.aabbMin, max: values.aabbMax },
        });

        setClosestPointAABBResult(response);
        setQueryStatus("success");
      } catch (err) {
        if (isAbortedRequest(err)) return;
        setQueryStatus("success");
      }
    },
    [setClosestPointAABBInputs, setError, setClosestPointAABBResult, setQueryStatus]
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
      <div className="grid gap-3 lg:grid-cols-3">
        <GeometryFields register={register} prefix="point" label="Point" symbol={objectLabels.point} errors={errors.point} />
        <GeometryFields register={register} prefix="aabbMin" label="Box minimum" symbol="min" errors={errors.aabbMin} />
        <GeometryFields register={register} prefix="aabbMax" label="Box maximum" symbol="max" errors={errors.aabbMax} />
      </div>
      <FormActions isSubmitting={isSubmitting} label="Find closest point" />
    </form>
  );
}
