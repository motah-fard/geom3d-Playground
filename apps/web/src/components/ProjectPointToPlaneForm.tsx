"use client";

import { z } from "zod";
import { useForm, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectPointToPlane } from "@/lib/api";
import { usePlaygroundStore } from "@/store/playground-store";

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
  } = usePlaygroundStore();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      point,
      planePoint,
      planeNormal,
    },
  });

  const onSubmit = async (values: FormValues) => {
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
  };

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
