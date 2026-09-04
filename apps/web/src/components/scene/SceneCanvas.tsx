"use client";

import { Canvas } from "@react-three/fiber";
import { Bounds, OrbitControls } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { QUERY_META } from "@/lib/query-meta";
import { useState } from "react";
import { AnglesScene } from "@/components/scene/queries/AnglesScene";
import { PythagoreanScene } from "@/components/scene/queries/PythagoreanScene";
import { RightTriangleTrigScene } from "@/components/scene/queries/RightTriangleTrigScene";
import { CircleMeasuresScene } from "@/components/scene/queries/CircleMeasuresScene";
import { RegularPolygonScene } from "@/components/scene/queries/RegularPolygonScene";
import { TransformationsScene } from "@/components/scene/queries/TransformationsScene";
import { SolidsScene } from "@/components/scene/queries/SolidsScene";
import { CrossSectionScene } from "@/components/scene/queries/CrossSectionScene";
import { NetScene } from "@/components/scene/queries/NetScene";
import { PointToPlaneScene } from "@/components/scene/queries/PointToPlaneScene";
import { IntersectRayPlaneScene } from "@/components/scene/queries/IntersectRayPlaneScene";
import { ClosestPointSegmentScene } from "@/components/scene/queries/ClosestPointSegmentScene";
import { SegmentSegmentScene } from "@/components/scene/queries/SegmentSegmentScene";
import { IntersectRayAABBScene } from "@/components/scene/queries/IntersectRayAABBScene";
import { ClosestPointAABBScene } from "@/components/scene/queries/ClosestPointAABBScene";
import { CartesianTransformScene } from "@/components/scene/queries/CartesianTransformScene";
import { LogSpiralScene } from "@/components/scene/queries/LogSpiralScene";
import { CellPackingScene } from "@/components/scene/queries/CellPackingScene";
import { HelicalShellScene } from "@/components/scene/queries/HelicalShellScene";
import { SquareCubeLawScene } from "@/components/scene/queries/SquareCubeLawScene";
import { CatenaryScene } from "@/components/scene/queries/CatenaryScene";
import { AllometricGrowthScene } from "@/components/scene/queries/AllometricGrowthScene";
import { PhyllotaxisScene } from "@/components/scene/queries/PhyllotaxisScene";
import { LogisticGrowthScene } from "@/components/scene/queries/LogisticGrowthScene";
import { GeodesicSphereScene } from "@/components/scene/queries/GeodesicSphereScene";
import { WhirlingSquaresScene } from "@/components/scene/queries/WhirlingSquaresScene";
import { CatenoidScene } from "@/components/scene/queries/CatenoidScene";
import { MilkCoronetScene } from "@/components/scene/queries/MilkCoronetScene";
import { EggCurveScene } from "@/components/scene/queries/EggCurveScene";
import { HelicoidScene } from "@/components/scene/queries/HelicoidScene";
import { BeeCellScene } from "@/components/scene/queries/BeeCellScene";

export function SceneCanvas() {
  const store = usePlaygroundStore();
  const { queryType, stepMode, setStepMode, queryStatus, isDragging, setSelectedObject } = store;
  const [view, setView] = useState<"perspective" | "top" | "front" | "side">("perspective");
  const [showTable, setShowTable] = useState(false);
  const meta = QUERY_META[queryType];
  const cameraPosition: [number, number, number] = view === "top" ? [0, 10, 0.001] : view === "front" ? [0, 0, 10] : view === "side" ? [10, 0, 0] : [6, 5, 6];
  const sceneObjects = queryType === "project-point-to-plane" || queryType === "closest-point-aabb"
    ? [{ id: "point", role: "Point", value: store.point }]
    : queryType === "intersect-ray-plane" || queryType === "intersect-ray-aabb"
      ? [{ id: "rayOrigin", role: "Ray origin", value: store.rayOrigin }]
      : queryType === "closest-point-segment"
        ? [{ id: "point", role: "Point", value: store.point }, { id: "segmentA", role: "Segment start", value: store.segmentA }, { id: "segmentB", role: "Segment end", value: store.segmentB }]
        : queryType === "cartesian-transform"
          ? [{ id: "transformP00", role: "Bottom-left", value: store.transformP00 }, { id: "transformP10", role: "Bottom-right", value: store.transformP10 }, { id: "transformP01", role: "Top-left", value: store.transformP01 }, { id: "transformP11", role: "Top-right", value: store.transformP11 }]
          : queryType === "log-spiral-growth"
            ? [{ id: "spiralStart", role: "Start radius", value: store.spiralStart }, { id: "spiralTurn", role: "Radius after one turn", value: store.spiralTurn }]
            : queryType === "cell-packing"
              ? [{ id: "cellCenter", role: "Growth center", value: store.cellCenter }]
              : queryType === "helical-shell-growth"
                ? [{ id: "helixStart", role: "Base radius", value: store.helixStart }, { id: "helixTurn", role: "Radius and rise after one turn", value: store.helixTurn }]
                : queryType === "square-cube-law"
                  ? [{ id: "magnitudePoint", role: "Radius", value: store.magnitudePoint }]
                  : queryType === "catenary-arch"
                    ? [{ id: "catenaryA", role: "Catenary parameter", value: store.catenaryA }]
                    : queryType === "allometric-growth"
                      ? [{ id: "allometrySize", role: "Body size", value: store.allometrySize }, { id: "allometryExponent", role: "Allometric exponent", value: store.allometryExponent }]
                      : queryType === "phyllotaxis"
                        ? [{ id: "phyllotaxisDivergence", role: "Divergence dial", value: store.phyllotaxisDivergence }]
                        : queryType === "logistic-growth"
                          ? [{ id: "logisticR", role: "Growth rate", value: store.logisticR }, { id: "logisticK", role: "Ceiling", value: store.logisticK }]
                          : queryType === "geodesic-sphere"
                            ? [{ id: "geodesicDetail", role: "Subdivision level", value: store.geodesicDetail }]
                            : queryType === "whirling-squares"
                              ? [{ id: "whirlingCount", role: "Square count", value: store.whirlingCount }]
                              : queryType === "catenoid"
                                ? [{ id: "catenoidA", role: "Waist parameter", value: store.catenoidA }]
                                : queryType === "milk-coronet"
                                  ? [{ id: "milkRadius", role: "Rim radius", value: store.milkRadius }, { id: "milkCount", role: "Crown points", value: store.milkCount }]
                                  : queryType === "egg-curve"
                                    ? [{ id: "eggBig", role: "Round end radius", value: store.eggBig }, { id: "eggSmall", role: "Pointed end radius", value: store.eggSmall }]
                                    : queryType === "helicoid"
                                      ? [{ id: "helicoidRadius", role: "Ribbon radius", value: store.helicoidRadius }, { id: "helicoidPitch", role: "Pitch point", value: store.helicoidPitch }]
                                      : queryType === "bee-cell"
                                        ? [{ id: "beeCellRise", role: "Trim / apex rise", value: store.beeCellRise }]
                                        : queryType === "angles"
                                          ? [{ id: "angleRayB", role: "Ray B direction", value: store.angleRayB }]
                                          : queryType === "pythagorean-theorem"
                                            ? [{ id: "pythagoreanLegA", role: "Leg A", value: store.pythagoreanLegA }, { id: "pythagoreanLegB", role: "Leg B", value: store.pythagoreanLegB }]
                                            : queryType === "right-triangle-trig"
                                              ? [{ id: "trigAngle", role: "Angle direction", value: store.trigAngle }]
                                              : queryType === "circle-measures"
                                                ? [{ id: "circleRadius", role: "Radius", value: store.circleRadius }, { id: "circleAngle", role: "Central angle direction", value: store.circleAngle }]
                                                : queryType === "regular-polygon"
                                                  ? [{ id: "polygonSides", role: "Side count", value: store.polygonSides }, { id: "polygonRadius", role: "Circumradius", value: store.polygonRadius }]
                                                  : queryType === "transformations"
                                                    ? [{ id: "transformTranslation", role: "Translation", value: store.transformTranslation }, { id: "transformHandle", role: "Rotate + scale handle", value: store.transformHandle }]
                                                    : queryType === "solids-3d"
                                                      ? [{ id: "solidDimA", role: "Dimension A", value: store.solidDimA }, { id: "solidDimB", role: "Dimension B", value: store.solidDimB }, { id: "solidDimC", role: "Dimension C", value: store.solidDimC }]
                                                      : queryType === "cross-sections"
                                                        ? [{ id: "crossSectionTilt", role: "Plane tilt", value: store.crossSectionTilt }, { id: "crossSectionOffset", role: "Plane offset", value: store.crossSectionOffset }]
                                                        : queryType === "nets"
                                                          ? [{ id: "netFold", role: "Fold amount", value: store.netFold }]
                                                          : [{ id: "segmentA1", role: "Segment A start", value: store.segmentA1 }, { id: "segmentA2", role: "Segment A end", value: store.segmentA2 }, { id: "segmentB1", role: "Segment B start", value: store.segmentB1 }, { id: "segmentB2", role: "Segment B end", value: store.segmentB2 }];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700/80 bg-[#09131c] shadow-2xl shadow-black/20">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/70 px-3 py-2.5">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="relative flex h-2 w-2">
            {queryStatus === "running" && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-60" />}
            <span className={`relative inline-flex h-2 w-2 rounded-full ${queryStatus === "running" ? "bg-amber-300" : "bg-emerald-400"}`} />
          </span>
          <span>{queryStatus === "running" ? "Updating geometry…" : meta.instruction}</span>
        </div>
        <div className="flex items-center gap-1" aria-label="Viewport controls">
          {queryType === "project-point-to-plane" && (
            <label className="mr-2 flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-400 hover:bg-slate-800">
              <input type="checkbox" checked={stepMode} onChange={(event) => setStepMode(event.target.checked)} className="accent-cyan-300" />
              Construction lines
            </label>
          )}
          <button type="button" aria-pressed={view === "top"} onClick={() => setView("top")} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white aria-pressed:bg-slate-700 aria-pressed:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">Top</button>
          <button type="button" aria-pressed={view === "front"} onClick={() => setView("front")} className="hidden rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white aria-pressed:bg-slate-700 aria-pressed:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:block">Front</button>
          <button type="button" aria-pressed={view === "side"} onClick={() => setView("side")} className="hidden rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white aria-pressed:bg-slate-700 aria-pressed:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:block">Side</button>
          <button type="button" aria-pressed={view === "perspective"} onClick={() => setView("perspective")} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white aria-pressed:bg-slate-700 aria-pressed:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">Perspective</button>
          <button type="button" aria-pressed={showTable} onClick={() => setShowTable((value) => !value)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white aria-pressed:bg-slate-700 aria-pressed:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">Table</button>
        </div>
      </div>

      <div className="relative h-[440px] w-full sm:h-[560px]" role="application" aria-label={`Interactive 3D viewport for ${meta.title}. ${meta.instruction}`}>
        <Canvas key={`${queryType}-${view}`} orthographic={view !== "perspective"} camera={view === "perspective" ? { position: cameraPosition, fov: 48 } : { position: cameraPosition, zoom: 58, near: 0.1, far: 1000 }} dpr={[1, 2]} gl={{ preserveDrawingBuffer: true }} onPointerMissed={() => setSelectedObject(null)}>
          <color attach="background" args={["#09131c"]} />
          <fog attach="fog" args={["#09131c", 14, 32]} />
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 8, 5]} intensity={1.4} />
          <OrbitControls makeDefault enabled={!isDragging} enableDamping dampingFactor={0.08} minDistance={3} maxDistance={24} />
          <gridHelper args={[40, 40, "#28465a", "#142a38"]} />
          <axesHelper args={[4]} />
          <Bounds fit clip margin={1.35}>
            {queryType === "angles" && <AnglesScene />}
            {queryType === "pythagorean-theorem" && <PythagoreanScene />}
            {queryType === "right-triangle-trig" && <RightTriangleTrigScene />}
            {queryType === "circle-measures" && <CircleMeasuresScene />}
            {queryType === "regular-polygon" && <RegularPolygonScene />}
            {queryType === "transformations" && <TransformationsScene />}
            {queryType === "solids-3d" && <SolidsScene />}
            {queryType === "cross-sections" && <CrossSectionScene />}
            {queryType === "nets" && <NetScene />}
            {queryType === "project-point-to-plane" && <PointToPlaneScene />}
            {queryType === "intersect-ray-plane" && <IntersectRayPlaneScene />}
            {queryType === "closest-point-segment" && <ClosestPointSegmentScene />}
            {queryType === "segment-segment" && <SegmentSegmentScene />}
            {queryType === "intersect-ray-aabb" && <IntersectRayAABBScene />}
            {queryType === "closest-point-aabb" && <ClosestPointAABBScene />}
            {queryType === "cartesian-transform" && <CartesianTransformScene />}
            {queryType === "log-spiral-growth" && <LogSpiralScene />}
            {queryType === "cell-packing" && <CellPackingScene />}
            {queryType === "helical-shell-growth" && <HelicalShellScene />}
            {queryType === "square-cube-law" && <SquareCubeLawScene />}
            {queryType === "catenary-arch" && <CatenaryScene />}
            {queryType === "allometric-growth" && <AllometricGrowthScene />}
            {queryType === "phyllotaxis" && <PhyllotaxisScene />}
            {queryType === "logistic-growth" && <LogisticGrowthScene />}
            {queryType === "geodesic-sphere" && <GeodesicSphereScene />}
            {queryType === "whirling-squares" && <WhirlingSquaresScene />}
            {queryType === "catenoid" && <CatenoidScene />}
            {queryType === "milk-coronet" && <MilkCoronetScene />}
            {queryType === "egg-curve" && <EggCurveScene />}
            {queryType === "helicoid" && <HelicoidScene />}
            {queryType === "bee-cell" && <BeeCellScene />}
          </Bounds>
        </Canvas>
        <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-2 rounded-lg border border-white/10 bg-slate-950/80 px-2.5 py-2 text-[10px] text-slate-300 backdrop-blur">
          <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-pink-400" /> draggable input</span>
          <span className="flex items-center gap-1.5"><i className="h-0.5 w-3 bg-blue-400" /> geometry</span>
          <span className="flex items-center gap-1.5"><i className="h-0.5 w-3 bg-orange-400" /> measured path</span>
        </div>
        <p className="sr-only">Coordinates are also available in the geometry inputs. The numeric result below is the accessible alternative to this scene.</p>
      </div>
      {showTable && (
        <div className="overflow-x-auto border-t border-slate-800 bg-slate-950/80 p-3">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">Current editable scene objects and coordinates</caption>
            <thead className="text-[10px] uppercase tracking-wider text-slate-600"><tr><th className="px-2 py-1">Object</th><th className="px-2 py-1">Role</th><th className="px-2 py-1">X</th><th className="px-2 py-1">Y</th><th className="px-2 py-1">Z</th></tr></thead>
            <tbody>{sceneObjects.map((object) => <tr key={object.id} className="border-t border-slate-800 text-slate-300"><th className="px-2 py-2 font-mono text-cyan-200">{store.objectLabels[object.id]}</th><td className="px-2 py-2 text-slate-500">{object.role}</td><td className="px-2 py-2 font-mono">{object.value.x}</td><td className="px-2 py-2 font-mono">{object.value.y}</td><td className="px-2 py-2 font-mono">{object.value.z}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
