# geom3d-Playground
An interactive 3D geometry lab for practical queries and spatial reasoning

# geom3d Playground

An interactive 3D geometry lab for practical queries and spatial reasoning.

## Goal

Build a full-stack app around the `geom3d` library with:

* **Frontend:** Next.js + TypeScript
* **Backend:** Go
* **Core idea:** users create points, vectors, rays, planes, segments, triangles, and AABBs, then run practical geometry queries visually and numerically.

---

## Product vision

The playground should feel like a practical engineering tool, not a game engine demo.

Users should be able to:

1. Define 3D primitives
2. Adjust them interactively
3. Run queries like distance, projection, intersection, closest point
4. See both:

   * a **3D visualization**
   * a **structured numeric/result panel**
5. Save and share scenarios later

---

## Recommended architecture

## Monorepo structure

```text
geom3d-playground/
  apps/
    web/                # Next.js frontend
  services/
    api/                # Go backend wrapping geom3d
  packages/
    schemas/            # shared TS schemas/types if needed later
  README.md
  docker-compose.yml
```

---

## Frontend stack

Use:

* **Next.js App Router**
* **TypeScript**
* **Tailwind CSS**
* **react-three-fiber** for 3D scene rendering
* **@react-three/drei** for controls/helpers
* **Zustand** for local playground state
* **React Hook Form + Zod** for forms and validation

### Why this stack

* Next.js App Router is the current standard path for new Next.js apps.
* TypeScript keeps the geometry input/output models sane.
* react-three-fiber gives a flexible WebGL scene without forcing you into game-engine nonsense.
* Zustand is small and ideal for scene/UI state.

---

## Backend stack

Use:

* **Go 1.26**
* Standard `net/http` for the first version
* Internal service layer around `geom3d`
* JSON REST API

Optional later:

* Chi for routing
* OpenAPI generation
* Scenario persistence with SQLite/Postgres

### Why standard library first

Your API is not complicated enough to deserve framework theater yet.
Standard `net/http` keeps the first version simple, fast, and easy to test.

---

## MVP features

## Geometry objects

Support these first:

* Point3
* Vec3
* Segment3
* Ray3
* Plane
* Triangle3
* AABB

## Queries

Start with a practical set that maps well to your library:

1. Point to plane projection
2. Point to segment closest point
3. Point to ray closest point
4. Distance between point and segment
5. Distance between point and ray
6. Ray-plane intersection
7. Ray-AABB intersection
8. AABB closest point to point
9. Segment length / direction
10. Plane validity / ray validity

These are enough for a strong first release.

---

## UX layout

## Main screen

Three-column layout:

### Left panel

**Scene Objects**

* add object
* edit coordinates
* toggle visibility
* delete object

### Center panel

**3D Viewport**

* orbit controls
* grid/axes
* selectable objects
* highlighted query results

### Right panel

**Query Runner / Results**

* choose query type
* select required objects
* show result JSON
* show derived values and explanations

---

## Example user flows

### Flow 1: projection

* Add point P
* Add plane Π
* Click “Project point onto plane”
* See projected point rendered in viewport
* See coordinates and distance in results panel

### Flow 2: ray-plane intersection

* Add ray R
* Add plane Π
* Click “Intersect ray with plane”
* Show whether hit exists
* If yes, render hit point and parameter t

### Flow 3: point to segment distance

* Add point P
* Add segment S
* Run query
* Show closest point C on segment and numeric distance

---

## API design

Use object-based requests so the frontend does not have to duplicate geometry logic.

## Health

`GET /api/v1/health`

Response:

```json
{ "status": "ok" }
```

## Projection example

`POST /api/v1/queries/project-point-to-plane`

Request:

```json
{
  "point": { "x": 1, "y": 2, "z": 3 },
  "plane": {
    "point": { "x": 0, "y": 0, "z": 0 },
    "normal": { "x": 0, "y": 0, "z": 1 }
  }
}
```

Response:

```json
{
  "projectedPoint": { "x": 1, "y": 2, "z": 0 },
  "distance": 3
}
```

## Ray-plane intersection

`POST /api/v1/queries/intersect-ray-plane`

Request:

```json
{
  "ray": {
    "origin": { "x": 0, "y": 0, "z": 5 },
    "dir": { "x": 0, "y": 0, "z": -1 }
  },
  "plane": {
    "point": { "x": 0, "y": 0, "z": 0 },
    "normal": { "x": 0, "y": 0, "z": 1 }
  }
}
```

Response:

```json
{
  "hit": true,
  "point": { "x": 0, "y": 0, "z": 0 },
  "t": 5
}
```

## Point-segment distance

`POST /api/v1/queries/distance-point-segment`

Request:

```json
{
  "point": { "x": 1, "y": 1, "z": 0 },
  "segment": {
    "a": { "x": 0, "y": 0, "z": 0 },
    "b": { "x": 2, "y": 0, "z": 0 }
  }
}
```

Response:

```json
{
  "closestPoint": { "x": 1, "y": 0, "z": 0 },
  "distance": 1
}
```

---

## Backend project structure

```text
services/api/
  cmd/server/main.go
  internal/http/handlers.go
  internal/http/router.go
  internal/domain/types.go
  internal/service/queries.go
  internal/service/queries_test.go
  go.mod
```

## Backend responsibilities

### `internal/domain/types.go`

Defines API DTOs:

* PointDTO
* VecDTO
* SegmentDTO
* RayDTO
* PlaneDTO
* Query request/response structs

### `internal/service/queries.go`

Converts DTOs into `geom3d` types and runs calculations.

### `internal/http/handlers.go`

HTTP parsing, validation, encoding, and error responses.

---

## Frontend project structure

```text
apps/web/
  src/
    app/
      page.tsx
      layout.tsx
    components/
      viewport/
        SceneCanvas.tsx
        Grid.tsx
        Axes.tsx
        GeometryRenderer.tsx
      sidebar/
        ObjectEditor.tsx
        QueryPanel.tsx
        ResultsPanel.tsx
    lib/
      api.ts
      geometry.ts
    store/
      playground-store.ts
    types/
      geometry.ts
```

---

## Frontend state model

```ts
export type Vec3 = {
  x: number;
  y: number;
  z: number;
};

export type SceneObject =
  | { id: string; type: 'point'; point: Vec3; label: string }
  | { id: string; type: 'segment'; a: Vec3; b: Vec3; label: string }
  | { id: string; type: 'ray'; origin: Vec3; dir: Vec3; label: string }
  | { id: string; type: 'plane'; point: Vec3; normal: Vec3; label: string }
  | { id: string; type: 'aabb'; min: Vec3; max: Vec3; label: string }
  | { id: string; type: 'triangle'; a: Vec3; b: Vec3; c: Vec3; label: string };
```

---

## Suggested MVP screen behavior

## Initial seed objects

When app loads, pre-populate:

* one point
* one plane
* one ray

That gives the user something to play with immediately, which is apparently still necessary because empty screens terrify everyone.

## Scene interactions

For v1:

* edit via numeric forms
* orbit camera
* hover highlight

For v2:

* drag handles in 3D
* snapping
* measurement overlays

---

## API client example

```ts
export async function projectPointToPlane(input: {
  point: { x: number; y: number; z: number };
  plane: {
    point: { x: number; y: number; z: number };
    normal: { x: number; y: number; z: number };
  };
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/queries/project-point-to-plane`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error('Request failed');
  }

  return res.json();
}
```

---

## Backend handler sketch

```go
func (h *Handler) ProjectPointToPlane(w http.ResponseWriter, r *http.Request) {
	var req ProjectPointToPlaneRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid json"})
		return
	}

	resp, err := h.queries.ProjectPointToPlane(r.Context(), req)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, resp)
}
```

---

## Version 1 roadmap

## Phase 1: backend foundation

* create Go API service
* add health endpoint
* add 3 query endpoints:

  * project point to plane
  * intersect ray with plane
  * distance point to segment
* add tests
* add CORS for local frontend

## Phase 2: frontend foundation

* create Next app
* build 3-column layout
* add object editor
* add query panel
* add results panel
* connect to backend

## Phase 3: 3D viewport

* render points, segments, rays, planes
* add grid and axes
* add result highlights
* sync panel state with scene

## Phase 4: polish

* URL-based scenario serialization
* example presets
* copy result JSON
* dark mode
* error states and inline validation

---

## Nice later features

* Scenario save/load
* Shareable links
* Export/import JSON scenes
* Step-by-step math explanation panel
* Query history
* Snap to canonical axes/planes
* Compare multiple query outputs
* WebAssembly version for some client-side calculations
* Auth and saved workspaces

---

## Recommended first milestone

Build this exact thin slice first:

### Objects

* point
* plane
* ray
* segment

### Queries

* point to plane projection
* ray-plane intersection
* point to segment distance

### UI

* numeric object editor
* simple 3D viewport
* results panel

That is enough to prove the playground is real.

---

## Suggested next implementation step

Start by scaffolding both apps and wiring one end-to-end feature:

**point to plane projection**

That single slice will validate:

* request/response contracts
* frontend form flow
* visualization model
* backend wrapping of `geom3d`

Once that works, the rest becomes repetition instead of existential suffering.
