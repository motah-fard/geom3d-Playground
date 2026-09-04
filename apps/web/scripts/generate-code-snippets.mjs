#!/usr/bin/env node
// Regenerates src/lib/code-snippets.generated.ts by extracting the real
// function source (doc comment + body, verbatim) that each chapter's scene
// actually calls out of local-geometry.ts. Run this again after editing
// local-geometry.ts if you want the "Code" tab to reflect the change:
//
//   pnpm generate:code-snippets
//
// Extraction is a plain brace-depth scan, not a real parser — it works
// because this file's functions are dry numeric code with no braces
// hiding inside strings or comments. It does not chase private helper
// functions a snippet calls; those are left out of the excerpt.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_PATH = path.join(__dirname, "../src/lib/local-geometry.ts");
const OUTPUT_PATH = path.join(__dirname, "../src/lib/code-snippets.generated.ts");
const SOURCE_LABEL = "src/lib/local-geometry.ts";

// One or more function names per chapter, in the order they should appear
// in the snippet. Names must match an `export function NAME(` in the
// source file exactly.
const CHAPTER_FUNCTIONS = {
  angles: ["localAngle"],
  "pythagorean-theorem": ["localPythagorean"],
  "right-triangle-trig": ["localRightTriangleTrig"],
  "circle-measures": ["localCircleMeasures"],
  "regular-polygon": ["regularPolygonVertex", "localRegularPolygon"],
  transformations: ["transformTrianglePoint", "localTransformations"],
  "solids-3d": ["localSolid"],
  "cross-sections": ["classifyConic", "localCrossSection"],
  nets: ["localNet", "foldCubeNet"],
  "project-point-to-plane": ["localProjectPointToPlane"],
  "intersect-ray-plane": ["localIntersectRayPlane"],
  "closest-point-segment": ["localClosestPointSegment"],
  "segment-segment": ["localSegmentSegment"],
  "intersect-ray-aabb": ["localIntersectRayAABB"],
  "closest-point-aabb": ["localClosestPointAABB"],
  "cartesian-transform": ["bilinearPoint", "localCartesianTransform"],
  "log-spiral-growth": ["logSpiralPoint", "localLogSpiral"],
  "cell-packing": ["voronoiCell", "localCellPacking"],
  "helical-shell-growth": ["helicalShellPoint", "localHelicalShell"],
  "square-cube-law": ["localSquareCubeLaw"],
  "catenary-arch": ["catenaryPoint", "localCatenary"],
  "allometric-growth": ["localAllometricGrowth"],
  phyllotaxis: ["phyllotaxisPoint", "localPhyllotaxis"],
  "logistic-growth": ["logisticPoint", "localLogisticGrowth"],
  "geodesic-sphere": ["localGeodesicSphere"],
  "whirling-squares": ["buildWhirlingSquares", "localWhirlingSquares"],
  catenoid: ["catenoidRadius", "localCatenoid"],
  "milk-coronet": ["milkCoronetSpikeAngle", "localMilkCoronet"],
  "egg-curve": ["localEggCurve"],
  helicoid: ["helicoidPoint", "localHelicoid"],
  "bee-cell": ["beeCellRimVertex", "beeCellApex", "localBeeCell"],
};

const source = readFileSync(SOURCE_PATH, "utf8");
const lines = source.split("\n");

function extractFunction(name) {
  const startPattern = new RegExp(`^(export\\s+)?function\\s+${name}\\s*[(<]`);
  let startLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (startPattern.test(lines[i])) {
      startLine = i;
      break;
    }
  }
  if (startLine === -1) throw new Error(`Function not found: ${name}`);

  // Walk backward over an immediately-preceding // doc comment block.
  let commentStart = startLine;
  while (commentStart > 0 && /^\s*\/\//.test(lines[commentStart - 1])) {
    commentStart -= 1;
  }

  // Walk forward from the signature, tracking brace depth, until it
  // returns to zero — that's the end of the function body.
  let depth = 0;
  let sawOpenBrace = false;
  let endLine = startLine;
  for (let i = startLine; i < lines.length; i++) {
    for (const ch of lines[i]) {
      if (ch === "{") {
        depth += 1;
        sawOpenBrace = true;
      } else if (ch === "}") {
        depth -= 1;
      }
    }
    if (sawOpenBrace && depth === 0) {
      endLine = i;
      break;
    }
  }

  return lines.slice(commentStart, endLine + 1).join("\n");
}

const snippets = {};
for (const [chapter, names] of Object.entries(CHAPTER_FUNCTIONS)) {
  snippets[chapter] = names.map(extractFunction).join("\n\n");
}

const banner = `// GENERATED FILE — do not edit by hand.
// Regenerate with: node scripts/generate-code-snippets.mjs
// Each entry is the real, verbatim source of the function(s) that
// chapter's scene actually calls, extracted from ${SOURCE_LABEL}.

import type { QueryType } from "@/types/geometry";

export type CodeSnippet = {
  sourceLabel: string;
  code: string;
};

export const CODE_SNIPPETS: Partial<Record<QueryType, CodeSnippet>> = ${JSON.stringify(
  Object.fromEntries(
    Object.entries(snippets).map(([chapter, code]) => [chapter, { sourceLabel: SOURCE_LABEL, code }])
  ),
  null,
  2
)};
`;

writeFileSync(OUTPUT_PATH, banner);
console.log(`Wrote ${Object.keys(snippets).length} snippets to ${path.relative(process.cwd(), OUTPUT_PATH)}`);
