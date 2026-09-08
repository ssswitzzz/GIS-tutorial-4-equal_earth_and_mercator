# EqualEarthIntro

52.118-second opening, 3840 x 2160, 60 fps, synchronized to `public/audio/intro.wav`.

## Direction

An editorial cartographic sequence: voting seats open into a map, geographic vertices morph between projections, the camera follows Greenland toward Africa, and equal-area silhouettes reveal the scale difference. The closing question is paired with a continuously rotating Three.js globe and the 1569 / 2018 / present timeline.

Chinese typography uses the bundled Source Han Serif CN SemiBold font. The shared PaperBackground remains consistent with the adjoining composition. Projection geometry and spherical transport use D3. All animation state comes from Remotion frames.

## Timing

`src/intro/timing.ts` owns subtitle boundaries and action timing. All times convert with `Math.round(seconds * fps)`.

| Seconds | Visual action |
| --- | --- |
| 0-8 | 164 seats assemble; one opposing seat is isolated |
| 8-16 | The map opens and continuously changes to Equal Earth |
| 16-25.05 | Africa gains emphasis; the camera moves into the map |
| 25.05-33 | Mercator returns; Greenland and Africa are highlighted |
| 33-35.7 | Greenland rotates on the sphere and is reprojected at its new latitude |
| 35.7-39 | Africa and 14 Greenland silhouettes share an equal-area scale |
| 39-43 | Return to the world map and reveal the Mercator title |
| 43-52.118 | Timeline draws; the globe rotates beside the closing question |

The ambiguous script marker `0:25:05` retains the original project's interpretation of 25.05 seconds. The ending follows the measured WAV duration. The voting statement is supplied narration, not independently verified reporting. The 14 silhouettes demonstrate approximate area equivalence, not literal geometric packing.

## Preview and render

Run in `remotion-video`:

```powershell
npm.cmd run dev -- --port 3001
npx.cmd remotion render src/index.ts EqualEarthIntro out/equal-earth-intro_4k60.mp4 --codec=h264 --crf=18 --gl=angle
```

The composition includes the narration track. Local map JSON and the bundled font are used; the render does not fetch remote visual assets.

Final MP4 rendering is owned by the user. No full video was rendered during delivery.

## Verification

- TypeScript: `npx.cmd tsc --noEmit` passed.
- Playwright: 21 checks at 1440 x 1000 and 390 x 844, including subtitle boundary frames, text bounds, and browser errors.
- WebGL: visible globe pixels verified; adjacent frames differ; seeking back reproduces the exact pixel hash.
- Geography: the source polygons give an Africa/Greenland area ratio of 14.4612; the equal-area drawings give 14.4576. Spherical transport preserves area at 21 sampled positions.
- Screenshots and browser results are saved in `out/intro-qa/`.
- The missing Windows compositor package was restored from the official 4.0.521 archive after checking its published SHA-512 integrity. Module loading and the bundled FFmpeg executable were checked without rendering a video.

Concurrent preview processes produced nonfatal Webpack cache-write warnings; bundling and the browser checks completed successfully.

The browser checker is `scripts/verify-intro.cjs`. It uses Playwright and Sharp from `INTRO_QA_MODULES`, or resolves local packages when that environment variable is omitted. It expects the preview server on port 3001 and the Chromium installation provided by Remotion.
