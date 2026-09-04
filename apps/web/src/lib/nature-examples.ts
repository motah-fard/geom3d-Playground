import type { QueryType } from "@/types/geometry";

// Specific, real instances of each chapter's mathematics — not generic
// "you might see this in nature" hand-waving. Several are the exact
// examples Thompson himself used.
export const NATURE_EXAMPLES: Partial<Record<QueryType, string>> = {
  "solids-3d": "A Minecraft block (cube), a soda can (cylinder), a basketball (sphere), a party hat (cone), and a tissue box (rectangular prism) — the six solids are the actual shape of half the objects in your room right now.",
  "cross-sections": "Slice a carrot straight across and you get a circle; slice it at an angle and you get an ellipse. Skate-park ramps and satellite dishes are shaped from a parabola for the exact same reason a steep enough cone-slice makes one — and it's the same math NASA uses to describe every planet's orbit around the sun.",
  "nets": "Cereal boxes, shipping boxes, dice, and paper party hats all start life as a flat, printed net that gets folded and glued into the 3D shape you actually hold — flat-pack furniture instructions are just a much bigger version of the same idea.",
  "angles": "A skateboarder calling a \"360\" (that's a full reflex-and-then-some spin), a basketball bouncing off the backboard at the same angle it came in, or a slice of pizza's pointy tip — every one of them is just two rays and the angle between them.",
  "pythagorean-theorem": "A phone's screen size (measured corner to corner) computed straight from its width and height, or a skateboard ramp builder squaring up a frame with a 3-4-5 triangle of string — same theorem, same trick, thousands of years apart.",
  "right-triangle-trig": "A video game camera figuring out how far you can see based on your character's height and view angle, or a video game's jump-arc physics — under the hood, both are just sin, cos, and tan read off a right triangle.",
  "circle-measures": "A pizza slice's area scaling exactly with the angle it's cut at, a bike wheel's circumference determining how far one spin carries you, or a Ferris wheel car's arc as it climbs — same circle math running all three.",
  "regular-polygon": "A stop sign's octagon, a soccer ball's pentagons and hexagons, a Minecraft honeycomb block, or a snowflake's six-fold symmetry — regular polygons are the default shape wherever a structure needs to tile, pack, or spin evenly.",
  "transformations": "A video game sprite that slides, spins, and resizes on screen every single frame, or a repeating wallpaper/quilt pattern — each copy is the same shape put through a translate-rotate-scale transformation, over and over.",
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
