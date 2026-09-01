// One-off/occasional tool: regenerates the PWA app icons as simple flat PNGs
// (a crosshair/objective-marker emblem, echoing Kill Team's objective tokens)
// without pulling in an image-processing dependency. Run with:
//   node scripts/generate-icons.mjs
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "icons");

const BG = [15, 17, 21]; // --bg
const ACCENT = [91, 141, 239]; // --accent
const WHITE = [238, 240, 244]; // --text

function crc32(buf) {
  let c;
  const table = crc32.table ?? (crc32.table = makeCrcTable());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = (crc ^ buf[i]) & 0xff;
    crc = (crc >>> 8) ^ table[c];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcInput = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = chunk("IHDR", ihdrData);

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = chunk("IDAT", deflateSync(raw));
  const iend = chunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function drawIcon(size, { maskable = false } = {}) {
  const rgba = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;

  // Safe-zone radius: maskable icons must keep content within the center ~80% circle.
  const outerR = maskable ? size * 0.36 : size * 0.42;
  const ringWidth = size * 0.07;
  const dotR = size * 0.09;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let color = BG;
      if (dist <= dotR) {
        color = WHITE;
      } else if (dist <= outerR && dist >= outerR - ringWidth) {
        color = ACCENT;
      } else if (
        // crosshair ticks
        (Math.abs(dx) < size * 0.012 && dist < outerR + ringWidth && dist > outerR - ringWidth * 2.5) ||
        (Math.abs(dy) < size * 0.012 && dist < outerR + ringWidth && dist > outerR - ringWidth * 2.5)
      ) {
        color = WHITE;
      }

      const i = (y * size + x) * 4;
      rgba[i] = color[0];
      rgba[i + 1] = color[1];
      rgba[i + 2] = color[2];
      rgba[i + 3] = 255;
    }
  }

  return encodePng(size, size, rgba);
}

writeFileSync(path.join(outDir, "icon-192.png"), drawIcon(192));
writeFileSync(path.join(outDir, "icon-512.png"), drawIcon(512));
writeFileSync(path.join(outDir, "icon-maskable-512.png"), drawIcon(512, { maskable: true }));

console.log("Generated icon-192.png, icon-512.png, icon-maskable-512.png in public/icons/");
