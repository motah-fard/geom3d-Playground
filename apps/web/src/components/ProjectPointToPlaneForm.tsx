"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAbortedRequest, projectPointToPlane } from "@/lib/api";
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
  planePoint: vec3Schema,
  planeNormal: vec3Schema,
}).refine(({ planeNormal }) => Math.hypot(planeNormal.x, planeNormal.y, planeNormal.z) > 0, {
  message: "Normal cannot be zero",
  path: ["planeNormal", "x"],
});

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

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
      setQueryStatus("running");

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
        setQueryStatus("success");
      } catch (err) {
        if (isAbortedRequest(err)) return;
        setQueryStatus("success");
      }
    },
    [setInputs, setError, setRayPlaneResult, setProjectPointResult, setQueryStatus]
  );

  // Auto-run when a drag updates the inputs.
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
        <GeometryFields register={register} prefix="planePoint" label="Plane anchor" symbol="Π" errors={errors.planePoint} />
        <GeometryFields register={register} prefix="planeNormal" label="Plane normal" symbol="n" hint="Direction perpendicular to the plane." errors={errors.planeNormal} />
      </div>
      <FormActions isSubmitting={isSubmitting} label="Project point" />
    </form>
  );
}
