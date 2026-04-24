"use client";

import { z } from "zod";
import { useForm, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { intersectRayPlane } from "@/lib/api";
import { usePlaygroundStore } from "@/store/playground-store";
import { useEffect } from "react";

const vec3Schema = z.object({
  x: z.coerce.number(),
  y: z.coerce.number(),
  z: z.coerce.number(),
});

const formSchema = z.object({
  rayOrigin: vec3Schema,
  rayDir: vec3Schema,
  planePoint: vec3Schema,
  planeNormal: vec3Schema,
});

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

function Vec3Fields({
  register,
  prefix,
  label,
}: {
  register: UseFormRegister<FormInput>;
  prefix: "rayOrigin" | "rayDir" | "planePoint" | "planeNormal";
  label: string;
}) {
  return (
    <div className="space-y-2 rounded-xl border p-4">
      <h3 className="font-medium">{label}</h3>
      <div className="grid grid-cols-3 gap-2">
        <input {...register(`${prefix}.x`)} placeholder="x" className="rounded border px-3 py-2" />
        <input {...register(`${prefix}.y`)} placeholder="y" className="rounded border px-3 py-2" />
        <input {...register(`${prefix}.z`)} placeholder="z" className="rounded border px-3 py-2" />
      </div>
    </div>
  );
}

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
  } = usePlaygroundStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
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

  const onSubmit = async (values: FormValues) => {
    setRayInputs(values);
    setError(null);
    setProjectPointResult(null);

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
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setRayPlaneResult(null);
    }
  };

  // ⚡ Auto-run when example is loaded
  useEffect(() => {
    if (!shouldAutoRun) return;

    handleSubmit(onSubmit)();
    setShouldAutoRun(false);
  }, [shouldAutoRun, handleSubmit, onSubmit, setShouldAutoRun]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Vec3Fields register={register} prefix="rayOrigin" label="Ray Origin" />
      <Vec3Fields register={register} prefix="rayDir" label="Ray Direction" />
      <Vec3Fields register={register} prefix="planePoint" label="Plane Point" />
      <Vec3Fields register={register} prefix="planeNormal" label="Plane Normal" />

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {isSubmitting ? "Running..." : "Intersect Ray with Plane"}
      </button>
    </form>
  );
}