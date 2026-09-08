# MercatorFilm

New independent chapter in `src/MercatorFilm.tsx` and `src/mercator/`.
184 seconds, 3840 x 2160, 60 fps, 11040 frames. No voiceover or final video is generated. Estimated spoken timing is centralized in `src/mercator/timing.ts`; adjust it after recording.

| Seconds | Action |
| --- | --- |
| 0-23 | A moving ship marker introduces Mercator's navigational purpose in 1569 |
| 23-45 | Paper wraps into a cylinder around a sphere; the equatorial contact is highlighted |
| 45-61 | The mapped cylinder continuously unrolls into a sheet |
| 61-98 | Parallel meridians introduce east-west expansion and local angle distortion |
| 98-115 | North-south compensation restores equal directional scaling |
| 115-135 | A ship follows a straight Mercator route at constant bearing |
| 135-161 | Area scale increases; the poles have no finite map coordinate |
| 161-184 | A street-level route turns through a right-angle intersection |

## Mathematical scope

The tangent cylinder is a construction metaphor, not a central-perspective projection. The map texture is calculated with D3's Mercator projection. The cylinder unrolling formula preserves lengths on the cylindrical sheet, not distances on the original sphere.

The spherical Mercator northing is logarithmic and its derivative with respect to latitude equals secant latitude. Both normalized local scale factors equal secant latitude; area scale is its square. North and south polar northings tend to positive and negative infinity respectively.

The route interpolates longitude and Mercator northing. Its bearing is constant (approximately 56.74 degrees), but it is not generally a shortest path and ignores obstacles, currents and wind. The navigation example illustrates local directions; Web Mercator and real navigation also involve tile systems, road data and positioning. Web Mercator's ellipsoidal approximation is not asserted to be perfectly conformal on the ellipsoid.

## Checks

```powershell
npx.cmd tsc --noEmit
node scripts/check-mercator-math.cjs
```

`scripts/verify-mercator.cjs` checks desktop/mobile typography, formula errors, canvas pixels, motion and repeatable seeking. It resolves Playwright and Sharp from `INTRO_QA_MODULES` or local modules and expects the studio on port 3003. Screenshots and results are in `out/mercator-qa`.

## Preview and user-owned export

```powershell
npm.cmd run dev -- --port 3003
npx.cmd remotion render src/index.ts MercatorFilm out/mercator_4k60.mp4 --codec=h264 --crf=18 --gl=angle
```

The final MP4 is intentionally left to the user.

## Manim integration

Adapted the construction motifs from `src/mercator_scene.py` into the existing frame-driven Three.js/SVG sequence. The original Python file is unchanged; no pre-rendered Manim clip is required.

- 34-49 seconds: shared geographic axis, polar markers and cylinder rims; rims follow the same isometric unrolling geometry as the paper.
- 45-49 seconds: corresponding sphere/cylinder points at 0, 45 and 70 degrees, joined using the actual logarithmic Mercator northing. These connections illustrate coordinate correspondence, not optical rays.
- 135-151 seconds: equal infinitesimal source circles at 0, 45 and 70 degrees grow with secant latitude. Displayed area factors are 1.00, 2.00 and 8.55. These are differential indicatrices, not a claim that every finite geographic circle stays circular.
