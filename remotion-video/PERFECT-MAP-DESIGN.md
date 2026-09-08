# PerfectMapFilm

Independent new composition: `src/PerfectMapFilm.tsx` and `src/perfect-map/`. The old Gauss composition is not imported or modified. Shared paper styling and source map data connect this film to the approved introduction.

## Timing and narration

176 seconds, 60 fps, 3840 x 2160, 10560 frames. No audio is attached. Narration text and editable estimated timings live in `src/perfect-map/timing.ts`. The timing is a provisional reading schedule, not alignment to a recorded voice track.

| Seconds | Narration and action |
| --- | --- |
| 0-10 | Establish the sphere and the impossible perfect map |
| 10-26 | Compare equally long equirectangular segments at two latitudes |
| 26-46 | Introduce Gauss and intrinsic curvature; trace two sphere sections |
| 46-58 | Compare positive sphere curvature with a flat surface |
| 58-70 | Flatten a spherical cap while preserving radial distances; show circumference stretching |
| 70-86 | Open orange-colored spherical gores; show cuts and remaining deformation |
| 86-94 | Introduce the three preservation priorities |
| 94-116 | Mercator: equal local directional scaling, increasing area scale |
| 116-138 | Equal Earth: equal-area small circles and reciprocal principal scaling |
| 138-162 | Azimuthal equidistant: center-to-point distances, then an unconstrained cross-distance |
| 162-176 | Return to the globe and conclude with the cartographer's choice |

## Mathematical boundaries

- The distance counterexample uses equirectangular mapping: equal longitude spans have equal map length at the equator and at 60 degrees, but unequal geodesic distances. No universal distance multiplier can fit both.
- Gauss's theorem concerns intrinsic curvature preserved by a local isometry. A sphere patch with positive curvature cannot be locally isometric to a plane.
- Flattening the cap keeps radial arc lengths. Its circumferences grow from `2 pi R sin(theta)` to `2 pi R theta`, demonstrating metric distortion rather than a no-stretch operation.
- The orange peel uses sinusoidal gores. This construction preserves area, not distances or angles; cuts alone do not remove intrinsic curvature. The on-screen annotation explicitly states that deformation remains.
- Projection indicatrices are sampled geographic small circles projected with D3, not decorative ellipses.
- Conformal preservation is local. The latitude-dependent area explosion is specifically demonstrated with Mercator, not asserted for every conformal projection.
- Equal-area principal scales multiply to one after normalization. Equal-area projection does not imply every continent must look extremely distorted.
- Equidistant projection preserves specified distance relationships, not all pairs. The three priorities are common design choices, not an exhaustive taxonomy of map projections.

## Implementation and validation

One persistent Three.js canvas owns the sphere, spherical cap, plane, and orange peel. D3 handles spherical interpolation and projection. KaTeX handles every formula. All state derives from Remotion frames; there are no CSS transitions or autonomous animation loops. Local assets only. No Manim video dependency is required.

```powershell
npx.cmd tsc --noEmit
node scripts/check-perfect-map-math.cjs
```

Browser checks: `scripts/verify-perfect-map.cjs`, using Playwright and Sharp resolved through `INTRO_QA_MODULES` or local packages. Checks desktop and mobile screenshots, text bounds, formula errors, canvas visibility, motion and deterministic seeking. Artifacts go in `out/perfect-map-qa/`.

Validation completed: TypeScript passed; mathematical invariants passed; 33 browser checks passed with zero runtime errors at 1440 x 1000 and 390 x 844. Representative screenshots were visually inspected and revised to remove text/graphic intersections. The old Gauss TSX file has no diff.

## Preview and user-owned render

```powershell
npm.cmd run dev -- --port 3002
npx.cmd remotion render src/index.ts PerfectMapFilm out/perfect-map_4k60.mp4 --codec=h264 --crf=18 --gl=angle
```

The final MP4 is rendered by the user. No video export is part of this delivery.
