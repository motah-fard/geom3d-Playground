import type { QueryType } from "@/types/geometry";

// Specific, real instances of each chapter's mathematics — not generic
// "you might see this in nature" hand-waving. Several are the exact
// examples Thompson himself used.
export const NATURE_EXAMPLES: Partial<Record<QueryType, string>> = {
  "cartesian-transform": "Thompson's own signature method: warping a coordinate grid drawn on one species (a porcupine fish, a human skull) until it fits a related species (a sunfish, a chimpanzee skull) — turning \"how are these related\" into a single continuous deformation.",
  "log-spiral-growth": "A nautilus shell, a ram's horn, a cat's claw, or an elephant's tusk — any structure that grows only by adding material at one open margin traces this exact curve, always crossing every radius at the same angle.",
  "cell-packing": "Froth in a glass of beer, cork cells under Robert Hooke's 17th-century microscope (the first living \"cells\" ever named), or dragonfly wing venation — cells that grow from separate centers until they touch settle into this hexagonal equilibrium.",
  "helical-shell-growth": "Turret shells and augers (Turritella, Terebra) — snails whose shells both widen and climb with every turn, unlike the flat, coiled-in-one-plane cross-section of a nautilus.",
  "square-cube-law": "Why an ant can lift many times its own weight but an elephant cannot, why insects breathe through skin-surface tubes instead of lungs, and why the tallest trees and largest land animals both run into hard structural ceilings.",
  "catenary-arch": "The Gateway Arch in St. Louis, Gaudí's hanging-chain models for the Sagrada Família, and every sagging power line or spider strand — the one curve that carries pure tension (or, inverted, pure compression) with no bending at all.",
  "allometric-growth": "A fiddler crab's one oversized claw, a stag beetle's mandibles, or a deer's antlers — each grows disproportionately faster than the rest of the body as the animal matures.",
  "phyllotaxis": "Sunflower seed heads, pinecone scales, pineapple eyes, and the florets of a romanesco — all pack their growing points at the same 137.5° divergence, the angle no simple fraction can approximate.",
  "logistic-growth": "A bacterial colony filling a petri dish, or a child's height plotted against age — rapid growth early, a fastest point at the halfway mark, then a leveling-off as some limiting resource or ceiling is approached.",
  "geodesic-sphere": "Radiolarian skeletons like Aulonia hexagona — the very organism Ernst Haeckel drew and Thompson compared to a geodesic lattice — and, much later, Buckminster Fuller's geodesic domes and the protein shells of many viruses.",
  "whirling-squares": "The proportioning system behind a nautilus shell's cross-section and countless classical building facades — the one rectangle whose leftover piece, after removing its largest square, is always a smaller copy of itself.",
  "catenoid": "Dip two wire rings in soap solution and pull them slowly apart: the film that forms between them is exactly this shape, and it holds until the rings are pulled too far apart, at which point it snaps to two flat disks.",
  "milk-coronet": "Harold Edgerton's and A.M. Worthington's iconic high-speed photographs of a drop of milk striking a surface — the \"milk-drop coronet,\" a crown of a fixed number of near-identical points thrown up around the splash.",
  "egg-curve": "A common guillemot's egg is famously this lopsided: sharply pointed at one end so that, nudged on a bare cliff ledge, it rolls in a tight circle instead of off the edge.",
  "helicoid": "A spiral parking ramp or staircase traces this surface's edge; dip a helical (screw-shaped) wire loop in soap solution and the film that forms across it is the real thing.",
  "bee-cell": "The honeycomb of the honeybee, Apis mellifera — measured angles on real comb come within a fraction of a degree of the wax-minimizing optimum this chapter computes.",
};
