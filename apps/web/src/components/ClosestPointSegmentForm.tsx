"use client";

import { z } from "zod";
import { useForm, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { closestPointSegment } from "@/lib/api";
import { usePlaygroundStore } from "@/store/playground-store";
import { useEffect } from "react";

const vec3Schema = z.object({
  x: z.coerce.number(),
  y: z.coerce.number(),
  z: z.coerce.number(),
});

const formSchema = z.object({
  point: vec3Schema,
  segmentA: vec3Schema,
  segmentB: vec3Schema,
});

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

function Vec3Fields({
  register,
  prefix,
  label,
}: {
  register: UseFormRegister<FormInput>;
  prefix: "point" | "segmentA" | "segmentB";
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

export function ClosestPointSegmentForm() {
  const {
    point,
    segmentA,
    segmentB,
    setSegmentInputs,
    setSegmentResult,
    setError,
    setResult,
    setRayPlaneResult,
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
      segmentA,
      segmentB,
    },
  });
  useEffect(() => {
  reset({
    point,
    segmentA,
    segmentB,
  });
}, [point, segmentA, segmentB, reset]);

  const onSubmit = async (values: FormValues) => {
    setSegmentInputs(values);

    // clear other results so UI doesn't mix things
    setResult(null);
    setRayPlaneResult(null);
    setError(null);

    try {
      const response = await closestPointSegment({
        point: values.point,
        segment: {
          a: values.segmentA,
          b: values.segmentB,
        },
      });

      setSegmentResult(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setSegmentResult(null);
    }
  };
    const { shouldAutoRun, setShouldAutoRun } = usePlaygroundStore();

    useEffect(() => {
        if (!shouldAutoRun) return;

        const run = async () => {
            try {
            const res = await closestPointSegment({
                point,
                segment: {
                a: segmentA,
                b: segmentB,
                },
            });

            setSegmentResult(res);
            } catch (err: any) {
            setError(err.message);
            } finally {
            setShouldAutoRun(false);
            }
        };

  run();
}, [shouldAutoRun]);
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Vec3Fields register={register} prefix="point" label="Point" />
      <Vec3Fields register={register} prefix="segmentA" label="Segment A" />
      <Vec3Fields register={register} prefix="segmentB" label="Segment B" />

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {isSubmitting ? "Running..." : "Closest Point to Segment"}
      </button>
    </form>
  );
}