"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { closestPointSegment, isAbortedRequest } from "@/lib/api";
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
  segmentA: vec3Schema,
  segmentB: vec3Schema,
});

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

export function ClosestPointSegmentForm() {
  const {
    point,
    segmentA,
    segmentB,
    setSegmentInputs,
    setSegmentResult,
    setError,
    setProjectPointResult,
    setRayPlaneResult,
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

  const onSubmit = useCallback(
    async (values: FormValues) => {
      setSegmentInputs(values);

      // clear other results so UI doesn't mix things
      setProjectPointResult(null);
      setRayPlaneResult(null);
      setError(null);
      setQueryStatus("running");

      try {
        const response = await closestPointSegment({
          point: values.point,
          segment: {
            a: values.segmentA,
            b: values.segmentB,
          },
        });

        setSegmentResult(response);
        setQueryStatus("success");
      } catch (err) {
        if (isAbortedRequest(err)) return;
        setQueryStatus("success");
      }
    },
    [setSegmentInputs, setProjectPointResult, setRayPlaneResult, setError, setSegmentResult, setQueryStatus]
  );

  // Auto-run when a drag (or an example) updates the inputs, reusing the
  // exact same submit path as a manual form submission rather than
  // duplicating the API call and its error handling.
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
        <GeometryFields register={register} prefix="segmentA" label="Segment start" symbol={objectLabels.segmentA} errors={errors.segmentA} />
        <GeometryFields register={register} prefix="segmentB" label="Segment end" symbol={objectLabels.segmentB} errors={errors.segmentB} />
      </div>
      <FormActions isSubmitting={isSubmitting} label="Find closest point" />
    </form>
  );
}
