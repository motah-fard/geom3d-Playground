"use client";

import { z } from "zod";
import { useForm, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { closestPointAABB } from "@/lib/api";
import { usePlaygroundStore } from "@/store/playground-store";
import { useCallback, useEffect } from "react";

const vec3Schema = z.object({
  x: z.coerce.number(),
  y: z.coerce.number(),
  z: z.coerce.number(),
});

const formSchema = z.object({
  point: vec3Schema,
  aabbMin: vec3Schema,
  aabbMax: vec3Schema,
});

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

function Vec3Fields({
  register,
  prefix,
  label,
}: {
  register: UseFormRegister<FormInput>;
  prefix: "point" | "aabbMin" | "aabbMax";
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

      try {
        const response = await closestPointAABB({
          point: values.point,
          aabb: { min: values.aabbMin, max: values.aabbMax },
        });

        setClosestPointAABBResult(response);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setError(message);
        setClosestPointAABBResult(null);
      }
    },
    [setClosestPointAABBInputs, setError, setClosestPointAABBResult]
  );

  useEffect(() => {
    if (!shouldAutoRun) return;

    handleSubmit(onSubmit)();
    setShouldAutoRun(false);
  }, [shouldAutoRun, handleSubmit, onSubmit, setShouldAutoRun]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Vec3Fields register={register} prefix="point" label="Point" />
      <Vec3Fields register={register} prefix="aabbMin" label="Box Min" />
      <Vec3Fields register={register} prefix="aabbMax" label="Box Max" />

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {isSubmitting ? "Running..." : "Closest Point to Box"}
      </button>
    </form>
  );
}
