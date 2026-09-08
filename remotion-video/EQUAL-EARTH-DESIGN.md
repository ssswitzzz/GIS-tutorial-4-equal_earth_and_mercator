# EqualEarthFilm

160.117 seconds (9607 frames), 3840 x 2160, 60 fps, aligned to the recorded narration. `src/equal-earth/model.ts` retains the original 230-second choreography; `src/narration.ts` maps it to the audio via `AnimationClock`. See `NARRATION-TIMING.md` for the full timeline. Times below refer to the authored choreography.

## Narrative

- 0-30: A wall map becomes an inherited picture of the world.
- 30-53: Mercator morphs into Gall-Peters, introducing the difference between equal area and visual shape.
- 53-87: Equal Earth appears, morphs to Robinson at authored 64 seconds (about 0:59 in the recording), moves to a Pacific-centered Robinson layout, then returns to Equal Earth at authored 80 seconds (about 1:15 in the recording).
- 87-120: Latitude rings assemble, then open into horizontal lines.
- 120-147: Their widths change to the actual Equal Earth widths, including finite polar edges.
- 147-171: Vertical positions change to Equal Earth northings, with reciprocal horizontal/vertical area factors.
- 171-204: Longitude marks appear; connecting equal longitudes constructs meridians.
- 204-230: The land and full geographic map replace the construction grid.

## Geometry and accuracy

The latitude-ring narrative is adapted from the existing `src/equal_earth_scene.py`; the original Manim code remains unchanged. Three.js provides a continuous frame-driven construction canvas inside Remotion, so no separately rendered Manim clip is required.

D3's published Equal Earth implementation is the authoritative forward transform. The temporary cut/open stages are explanatory deformations, not claimed equal-area maps. Only the completed transform has the tested area invariant.

With `x = lambda * A(phi)` and `y = B(phi)`, equal area requires `A(phi) * B'(phi) = cos(phi)` on the unit sphere. The displayed horizontal scale is `A(phi)/cos(phi)` and the vertical latitude scale is `B'(phi)`. Their product is one; off the central meridian the mapping also has shear, so these are not generally the two principal Tissot scales.

The polar-edge/equator width ratio is 0.5924668898. A finite polar boundary line is a map representation of the singular pole, not a finite physical latitude circle. Exact polar scale factors are not evaluated.

Gall-Peters is a cylindrical equal-area projection with standard parallels at 45 degrees. The 1970s are associated with Peters's promotion, not the original invention of every aspect of this projection. Equal Earth is inspired by Robinson's overall appearance but uses its own equal-area equations.

The Pacific-centered example uses the standard `geoRobinsonRaw` implementation from `d3-geo-projection`, with a central meridian at 180 degrees. It returns to Equal Earth before the latitude-ring construction. Robinson is explicitly identified as a compromise projection, not an equal-area projection. No specific textbook edition or UN resolution was supplied; these statements are not independently established by this animation.

Mercator maps now fit the full finite range of approximately 85.051 degrees north/south into the map area, displaying Greenland and the main Antarctic landmass. The exact poles remain at infinity. The cylinder texture uses the same square Mercator extent. The custom animation clock avoids Remotion's composition-range clamp; regression checks inspect actual component time and late-stage canvas pixels, not just the timing table.

## Validation

```powershell
npx.cmd tsc --noEmit
node scripts/check-equal-earth-math.cjs
```

Checks cover 35 latitudes for the area Jacobian, exact agreement of flattened construction coordinates with D3 Equal Earth, the polar-edge ratio, and contiguous beat timing.

`scripts/verify-equal-earth.cjs` uses Playwright and Sharp (resolved through `INTRO_QA_MODULES` or local packages). It checks desktop/mobile framing, text and formulas, canvas visibility, animation and repeatable seeking. The preview server must run on port 3004. Results and screenshots are in `out/equal-earth-qa`.

## User-owned rendering

```powershell
npm.cmd run dev -- --port 3004
npx.cmd remotion render src/index.ts EqualEarthFilm out/equal-earth_4k60.mp4 --codec=h264 --crf=18 --gl=angle
```

No final MP4 is generated during implementation.
