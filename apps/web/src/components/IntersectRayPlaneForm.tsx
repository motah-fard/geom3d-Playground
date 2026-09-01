"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { intersectRayPlane, isAbortedRequest } from "@/lib/api";
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
  planePoint: vec3Schema,
  planeNormal: vec3Schema,
})
  .refine(({ rayDir }) => Math.hypot(rayDir.x, rayDir.y, rayDir.z) > 0, { message: "Direction cannot be zero", path: ["rayDir", "x"] })
  .refine(({ planeNormal }) => Math.hypot(planeNormal.x, planeNormal.y, planeNormal.z) > 0, { message: "Normal cannot be zero", path: ["planeNormal", "x"] });

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

export function IntersectRayPlaneForm() {
  const {
    rayOrigin,
    rayDir,
    planePoint,
    planeNormal,
    setRayInputs,
    setRayPlaneResult,
    setProjectPointResult,
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
      planePoint,
      planeNormal,
    },
    
  });

  // 🔁 Sync form when store values change (important for examples)
  useEffect(() => {
    reset({
      rayOrigin,
      rayDir,
      planePoint,
      planeNormal,
    });
  }, [rayOrigin, rayDir, planePoint, planeNormal, reset]);

  const onSubmit = useCallback(
    async (values: FormValues) => {
      setRayInputs(values);
      setError(null);
      setProjectPointResult(null);
      setQueryStatus("running");

      try {
        const response = await intersectRayPlane({
          ray: {
            origin: values.rayOrigin,
            dir: values.rayDir,
          },
          plane: {
            point: values.planePoint,
            normal: values.planeNormal,
          },
        });

        setRayPlaneResult(response);
        setQueryStatus("success");
      } catch (err) {
        if (isAbortedRequest(err)) return;
        setQueryStatus("success");
      }
    },
    [setRayInputs, setError, setProjectPointResult, setRayPlaneResult, setQueryStatus]
  );

  // Auto-run when an example is loaded (or a drag updates the inputs).
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
        <GeometryFields register={register} prefix="rayDir" label="Ray direction" symbol="d" hint="Does not need to be normalized." errors={errors.rayDir} />
        <GeometryFields register={register} prefix="planePoint" label="Plane anchor" symbol="Π" errors={errors.planePoint} />
        <GeometryFields register={register} prefix="planeNormal" label="Plane normal" symbol="n" errors={errors.planeNormal} />
      </div>
      <FormActions isSubmitting={isSubmitting} label="Intersect ray and plane" />
    </form>
  );
}
