"use client";

import { z } from "zod";
import { useForm, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePlaygroundStore } from "@/store/playground-store";
import { segmentSegmentDistance } from "@/lib/api";

const vec3Schema = z.object({
  x: z.coerce.number(),
  y: z.coerce.number(),
  z: z.coerce.number(),
});

const formSchema = z.object({
  a1: vec3Schema,
  a2: vec3Schema,
  b1: vec3Schema,
  b2: vec3Schema,
});

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

function Vec3Fields({
  register,
  prefix,
  label,
}: {
  register: UseFormRegister<FormInput>;
  prefix: "a1" | "a2" | "b1" | "b2";
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

export function SegmentSegmentForm() {
  const {
    segmentA,
    segmentB,
    setSegmentSegmentResult,
    setError,
    setSegmentSegmentInputs,
  } = usePlaygroundStore();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      a1: segmentA,
      a2: { x: 3, y: 0, z: 0 }, // reasonable default
      b1: { x: 1, y: 2, z: 0 },
      b2: { x: 1, y: -2, z: 0 },
    },
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setSegmentSegmentInputs(values); // ✅ once, before API

    try {
      const response = await segmentSegmentDistance(values);

      setSegmentSegmentResult(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";

      setError(message);
      setSegmentSegmentResult(null);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Vec3Fields register={register} prefix="a1" label="Segment A - Start" />
      <Vec3Fields register={register} prefix="a2" label="Segment A - End" />
      <Vec3Fields register={register} prefix="b1" label="Segment B - Start" />
      <Vec3Fields register={register} prefix="b2" label="Segment B - End" />

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {isSubmitting ? "Running..." : "Segment-Segment Distance"}
      </button>
    </form>
  );
}
