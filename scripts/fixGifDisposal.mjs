/**
 * Re-encodes animated GIFs so every frame is a full, self-contained canvas
 * with a uniform disposal method (restore-to-background).
 *
 * Why: the original GIFs use an optimized encoding where alternating frames
 * only redraw the changed sub-rectangle and rely on the previous frame's
 * disposal method (2 = restore-to-background, 1 = leave-in-place) to
 * composite correctly. Browsers/OS image viewers implement that fine, but
 * Discord's link-embed image renderer does not correctly apply
 * "restore to background" disposal, so the leave-in-place frames end up
 * layered on top of stale pixels, producing a glitchy/overlapped look in
 * Discord embeds.
 *
 * The fix: decode each GIF frame-by-frame into a fully composited RGBA
 * canvas (replicating the standard GIF disposal algorithm ourselves), then
 * re-encode every frame as a full width/height frame with disposal=2. This
 * removes any dependency on a renderer correctly implementing partial-frame
 * compositing.
 *
 * Usage: node scripts/fixGifDisposal.mjs [rootDir]
 * Default rootDir: public/images/pokemon_gifs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GifReader } from 'omggif';
import { encodeGif } from '../src/pages/SpriteRecolour/gif-encoder.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const targetDir = path.resolve(
  rootDir,
  process.argv[2] || path.join('public', 'images', 'pokemon_gifs')
);

function findGifFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findGifFiles(fullPath));
    } else if (entry.name.toLowerCase().endsWith('.gif')) {
      results.push(fullPath);
    }
  }

  return results;
}

function clearRect(canvas, canvasWidth, x, y, w, h) {
  for (let row = 0; row < h; row += 1) {
    const rowStart = ((y + row) * canvasWidth + x) * 4;
    canvas.fill(0, rowStart, rowStart + w * 4);
  }
}

// Composites every frame of a GIF into a flat list of full-canvas RGBA frames.
function decomposeGif(buf) {
  const reader = new GifReader(buf);
  const width = reader.width;
  const height = reader.height;
  const numFrames = reader.numFrames();
  const canvas = new Uint8ClampedArray(width * height * 4);

  const frames = [];
  const delays = [];
  let prevInfo = null;
  let snapshot = null;

  for (let i = 0; i < numFrames; i += 1) {
    const info = reader.frameInfo(i);

    if (prevInfo) {
      if (prevInfo.disposal === 2) {
        clearRect(canvas, width, prevInfo.x, prevInfo.y, prevInfo.width, prevInfo.height);
      } else if (prevInfo.disposal === 3 && snapshot) {
        canvas.set(snapshot);
      }
    }

    snapshot = info.disposal === 3 ? canvas.slice() : null;

    reader.decodeAndBlitFrameRGBA(i, canvas);

    frames.push(canvas.slice());
    delays.push((info.delay || 0) * 10);
    prevInfo = info;
  }

  return { width, height, frames, delays };
}

async function fixGif(filePath) {
  const original = fs.readFileSync(filePath);
  const { width, height, frames, delays } = decomposeGif(new Uint8Array(original));
  const blob = await encodeGif(frames, width, height, delays);
  const buffer = Buffer.from(await blob.arrayBuffer());
  fs.writeFileSync(filePath, buffer);
  return { before: original.length, after: buffer.length };
}

async function main() {
  const files = findGifFiles(targetDir);
  console.log(`Found ${files.length} gif(s) under ${path.relative(rootDir, targetDir)}`);

  let fixed = 0;
  let failed = 0;

  for (const filePath of files) {
    try {
      const { before, after } = await fixGif(filePath);
      fixed += 1;
      console.log(`OK  ${path.relative(rootDir, filePath)} (${before}B -> ${after}B)`);
    } catch (err) {
      failed += 1;
      console.error(`FAIL ${path.relative(rootDir, filePath)}: ${err.message}`);
    }
  }

  console.log(`Done. Fixed ${fixed}, failed ${failed}.`);
}

main();
