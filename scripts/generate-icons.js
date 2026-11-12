const fs = require('fs');
const zlib = require('zlib');

function createPng(width, height, pixelFn) {
  // PNG signature
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // Scanlines with filter byte 0
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // filter none
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const idatData = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', idatData);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.slice(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// CRC32 implementation
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Generate 32x32 & 180x180 Cyberpunk Favicon
function renderCyberIcon(x, y, w, h) {
  const nx = x / (w - 1);
  const ny = y / (h - 1);

  // Rounded box radius
  const r = 0.22;
  const dx = Math.max(0, Math.abs(nx - 0.5) - (0.5 - r));
  const dy = Math.max(0, Math.abs(ny - 0.5) - (0.5 - r));
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > r) {
    return [0, 0, 0, 0]; // Transparent outside
  }

  // Border: neon cyan
  const isBorder = dist > r - 0.08 || nx < 0.08 || nx > 0.92 || ny < 0.08 || ny > 0.92;
  if (isBorder) {
    return [0, 243, 255, 255]; // #00f3ff
  }

  // Symbol coordinates
  // '>' chevron from (0.22, 0.28) to (0.48, 0.50) to (0.22, 0.72)
  const isChevron = (
    // upper line: y - x ~ constant
    (Math.abs((ny - 0.28) - (nx - 0.22) * 0.85) < 0.08 && nx >= 0.20 && nx <= 0.48) ||
    // lower line: y + x ~ constant
    (Math.abs((ny - 0.72) + (nx - 0.22) * 0.85) < 0.08 && nx >= 0.20 && nx <= 0.48)
  );

  if (isChevron) {
    return [0, 243, 255, 255]; // Neon cyan #00f3ff
  }

  // '_' underscore from (0.54, 0.70) to (0.78, 0.70)
  const isUnderscore = (ny >= 0.65 && ny <= 0.75 && nx >= 0.54 && nx <= 0.80);
  if (isUnderscore) {
    return [255, 0, 127, 255]; // Neon pink #ff007f
  }

  // Status dot at (0.80, 0.20)
  const sdist = Math.sqrt((nx - 0.80) ** 2 + (ny - 0.20) ** 2);
  if (sdist < 0.05) {
    return [0, 255, 157, 255]; // Emerald #00ff9d
  }

  // Background deep dark
  return [5, 7, 14, 255]; // #05070e
}

// Create 32x32 PNG
const png32 = createPng(32, 32, renderCyberIcon);
fs.writeFileSync('public/icon-32.png', png32);

// Create 180x180 PNG (apple-touch-icon)
const png180 = createPng(180, 180, renderCyberIcon);
fs.writeFileSync('public/apple-touch-icon.png', png180);

// Create ICO containing 32x32 PNG
const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0); // reserved
icoHeader.writeUInt16LE(1, 2); // type 1 = ICO
icoHeader.writeUInt16LE(1, 4); // 1 image

const icoEntry = Buffer.alloc(16);
icoEntry[0] = 32; // width
icoEntry[1] = 32; // height
icoEntry[2] = 0;  // colors
icoEntry[3] = 0;  // reserved
icoEntry.writeUInt16LE(1, 4); // color planes
icoEntry.writeUInt16LE(32, 6); // bpp
icoEntry.writeUInt32LE(png32.length, 8); // size
icoEntry.writeUInt32LE(22, 12); // offset (6 + 16 = 22)

const ico = Buffer.concat([icoHeader, icoEntry, png32]);
fs.writeFileSync('public/favicon.ico', ico);

console.log('Successfully generated public/icon-32.png, public/apple-touch-icon.png, and public/favicon.ico');
