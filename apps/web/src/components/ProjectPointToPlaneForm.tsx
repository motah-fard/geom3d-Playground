"use client";

import { z } from "zod";
import { useForm, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectPointToPlane } from "@/lib/api";
import { usePlaygroundStore } from "@/store/playground-store";
import { useCallback, useEffect } from "react";

const vec3Schema = z.object({
  x: z.coerce.number(),
  y: z.coerce.number(),
  z: z.coerce.number(),
});

const formSchema = z.object({
  point: vec3Schema,
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
  prefix: "point" | "planePoint" | "planeNormal";
  label: string;
}) {
  return (
    <div className="space-y-2 rounded-xl border p-4">
      <h3 className="font-medium">{label}</h3>
      <div className="grid grid-cols-3 gap-2">
        <input
          {...register(`${prefix}.x`)}
          placeholder="x"
          className="rounded border px-3 py-2"
        />
        <input
          {...register(`${prefix}.y`)}
          placeholder="y"
          className="rounded border px-3 py-2"
        />
        <input
          {...register(`${prefix}.z`)}
          placeholder="z"
          className="rounded border px-3 py-2"
        />
      </div>
    </div>
  );
}

export function ProjectPointToPlaneForm() {
  const {
    point,
    planePoint,
    planeNormal,
    setInputs,
    setProjectPointResult,
    setRayPlaneResult,
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
      point,
      planePoint,
      planeNormal,
    },
  });

  // Keep the form fields in sync when a drag in the scene updates the
  // store directly (this was previously missing here, unlike every other
  // query's form, so dragging the point never updated the displayed
  // coordinates or re-ran the query).
  useEffect(() => {
    reset({ point, planePoint, planeNormal });
  }, [point, planePoint, planeNormal, reset]);

  const onSubmit = useCallback(
    async (values: FormValues) => {
      setInputs(values);
      setError(null);
      setRayPlaneResult(null);
      setProjectPointResult(null);

      try {
        const response = await projectPointToPlane({
          point: values.point,
          plane: {
            point: values.planePoint,
            normal: values.planeNormal,
          },
        });

        setProjectPointResult({
          projectedPoint: response.projectedPoint,
          distance: response.distance,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";

        setError(message);
        setProjectPointResult(null);
      }
    },
    [setInputs, setError, setRayPlaneResult, setProjectPointResult]
  );

  // Auto-run when a drag updates the inputs.
  useEffect(() => {
    if (!shouldAutoRun) return;

    handleSubmit(onSubmit)();
    setShouldAutoRun(false);
  }, [shouldAutoRun, handleSubmit, onSubmit, setShouldAutoRun]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Vec3Fields register={register} prefix="point" label="Point" />
      <Vec3Fields register={register} prefix="planePoint" label="Plane Point" />
      <Vec3Fields
        register={register}
        prefix="planeNormal"
        label="Plane Normal"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {isSubmitting ? "Running..." : "Project Point to Plane"}
      </button>
    </form>
  );
}
