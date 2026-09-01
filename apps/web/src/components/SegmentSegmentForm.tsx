"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePlaygroundStore } from "@/store/playground-store";
import { isAbortedRequest, segmentSegmentDistance } from "@/lib/api";
import { FormActions, GeometryFields } from "@/components/GeometryFields";
import { useCallback, useEffect } from "react";

const vec3Schema = z.object({
  x: z.coerce.number({ error: "Enter a number" }).finite(),
  y: z.coerce.number({ error: "Enter a number" }).finite(),
  z: z.coerce.number({ error: "Enter a number" }).finite(),
});

const formSchema = z.object({
  a1: vec3Schema,
  a2: vec3Schema,
  b1: vec3Schema,
  b2: vec3Schema,
});

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

export function SegmentSegmentForm() {
  const {
    segmentA1,
    segmentA2,
    segmentB1,
    segmentB2,
    setSegmentSegmentResult,
    setError,
    setSegmentSegmentInputs,
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
      a1: segmentA1,
      a2: segmentA2,
      b1: segmentB1,
      b2: segmentB2,
    },
  });

  useEffect(() => {
    reset({ a1: segmentA1, a2: segmentA2, b1: segmentB1, b2: segmentB2 });
  }, [segmentA1, segmentA2, segmentB1, segmentB2, reset]);

  const onSubmit = useCallback(async (values: FormValues) => {
    setError(null);
    setSegmentSegmentInputs(values);
    setQueryStatus("running");

    try {
      const response = await segmentSegmentDistance(values);

      setSegmentSegmentResult(response);
      setQueryStatus("success");
    } catch (err) {
      if (isAbortedRequest(err)) return;
      setQueryStatus("success");
    }
  }, [setError, setSegmentSegmentInputs, setSegmentSegmentResult, setQueryStatus]);

  useEffect(() => {
    if (!shouldAutoRun) return;
    const timer = window.setTimeout(() => {
      setShouldAutoRun(false);
      handleSubmit(onSubmit)();
    }, 140);
    return () => window.clearTimeout(timer);
  }, [shouldAutoRun, segmentA1, segmentA2, segmentB1, segmentB2, handleSubmit, onSubmit, setShouldAutoRun]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} onSubmitCapture={saveCheckpoint} className="space-y-4" noValidate>
      <div className="grid gap-3 md:grid-cols-2">
        <GeometryFields register={register} prefix="a1" label="Segment A start" symbol={objectLabels.segmentA1} errors={errors.a1} />
        <GeometryFields register={register} prefix="a2" label="Segment A end" symbol={objectLabels.segmentA2} errors={errors.a2} />
        <GeometryFields register={register} prefix="b1" label="Segment B start" symbol={objectLabels.segmentB1} errors={errors.b1} />
        <GeometryFields register={register} prefix="b2" label="Segment B end" symbol={objectLabels.segmentB2} errors={errors.b2} />
      </div>
      <FormActions isSubmitting={isSubmitting} label="Measure segment distance" />
    </form>
  );
}
