"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { intersectRayAABB, isAbortedRequest } from "@/lib/api";
import { usePlaygroundStore } from "@/store/playground-store";
import { useCallback, useEffect } from "react";
import { FormActions, GeometryFields } from "@/components/GeometryFields";

const vec3Schema = z.object({
  x: z.coerce.number({ error: "Enter a number" }).finite(),
  y: z.coerce.number({ error: "Enter a number" }).finite(),
  z: z.coerce.number({ error: "Enter a number" }).finite(),
});

const formSchema = z.object({
  rayOrigin: vec3Schema,
  rayDir: vec3Schema,
  aabbMin: vec3Schema,
  aabbMax: vec3Schema,
})
  .refine(({ rayDir }) => Math.hypot(rayDir.x, rayDir.y, rayDir.z) > 0, { message: "Direction cannot be zero", path: ["rayDir", "x"] })
  .refine(({ aabbMin, aabbMax }) => aabbMin.x <= aabbMax.x && aabbMin.y <= aabbMax.y && aabbMin.z <= aabbMax.z, { message: "Min must not exceed max", path: ["aabbMin", "x"] });

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

export function IntersectRayAABBForm() {
  const {
    rayOrigin,
    rayDir,
    aabbMin,
    aabbMax,
    setRayAABBInputs,
    setRayAABBResult,
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
      rayOrigin,
      rayDir,
      aabbMin,
      aabbMax,
    },
  });

  useEffect(() => {
    reset({ rayOrigin, rayDir, aabbMin, aabbMax });
  }, [rayOrigin, rayDir, aabbMin, aabbMax, reset]);

  const onSubmit = useCallback(
    async (values: FormValues) => {
      setRayAABBInputs(values);
      setError(null);
      setQueryStatus("running");

      try {
        const response = await intersectRayAABB({
          ray: { origin: values.rayOrigin, dir: values.rayDir },
          aabb: { min: values.aabbMin, max: values.aabbMax },
        });

        setRayAABBResult(response);
        setQueryStatus("success");
      } catch (err) {
        if (isAbortedRequest(err)) return;
        setQueryStatus("success");
      }
    },
    [setRayAABBInputs, setError, setRayAABBResult, setQueryStatus]
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
      <div className="grid gap-3 md:grid-cols-2">
        <GeometryFields register={register} prefix="rayOrigin" label="Ray origin" symbol={objectLabels.rayOrigin} errors={errors.rayOrigin} />
        <GeometryFields register={register} prefix="rayDir" label="Ray direction" symbol="d" errors={errors.rayDir} />
        <GeometryFields register={register} prefix="aabbMin" label="Box minimum" symbol="min" errors={errors.aabbMin} />
        <GeometryFields register={register} prefix="aabbMax" label="Box maximum" symbol="max" errors={errors.aabbMax} />
      </div>
      <FormActions isSubmitting={isSubmitting} label="Intersect ray and box" />
    </form>
  );
}
