/**
 * 이미지 리사이즈 유틸.
 *
 * 정책:
 *   - 긴 변 maxLongSide 이하로 다운스케일 (원본보다 작지 않게)
 *   - JPEG 품질 0.9 (3MB 넘으면 낮춤)
 *   - EXIF 촬영 시각 추출
 */

const DEFAULT_MAX_LONG_SIDE = 1920; // 액티비티 사진
const COVER_MAX_LONG_SIDE = 2560; // 여행 커버 (큰 인포그래픽 대응)
const DEFAULT_QUALITY = 0.9;
const MIN_QUALITY = 0.6;
const MAX_BYTES = 3 * 1024 * 1024;

export { COVER_MAX_LONG_SIDE };

/**
 * @param {File} file
 * @param {object} [options]
 * @param {number} [options.maxLongSide] - 리사이즈 상한 (기본 1920)
 */
export async function resizeImage(file, options = {}) {
  const maxLongSide = options.maxLongSide || DEFAULT_MAX_LONG_SIDE;

  const bitmap = await createImageBitmap(file);
  const { width: origW, height: origH } = bitmap;

  const longSide = Math.max(origW, origH);
  const scale = longSide > maxLongSide ? maxLongSide / longSide : 1;
  const targetW = Math.round(origW * scale);
  const targetH = Math.round(origH * scale);

  const canvas =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(targetW, targetH)
      : Object.assign(document.createElement("canvas"), {
          width: targetW,
          height: targetH,
        });
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  bitmap.close?.();

  let quality = DEFAULT_QUALITY;
  let blob = await canvasToBlob(canvas, quality);
  while (blob.size > MAX_BYTES && quality > MIN_QUALITY) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, quality);
  }

  let takenAt = null;
  try {
    takenAt = await extractExifDate(file);
  } catch (_) {}

  return {
    blob,
    width: targetW,
    height: targetH,
    sizeBytes: blob.size,
    takenAt,
  };
}

async function canvasToBlob(canvas, quality) {
  if (canvas.convertToBlob) {
    return canvas.convertToBlob({ type: "image/jpeg", quality });
  }
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Blob 변환 실패"))),
      "image/jpeg",
      quality,
    );
  });
}

/* ─── EXIF (기존과 동일) ─── */

async function extractExifDate(file) {
  const buf = await file.slice(0, 128 * 1024).arrayBuffer();
  const view = new DataView(buf);
  if (view.getUint16(0) !== 0xffd8) return null;

  let offset = 2;
  while (offset < view.byteLength) {
    const marker = view.getUint16(offset);
    if (marker === 0xffe1) {
      const size = view.getUint16(offset + 2);
      const exifHeader = String.fromCharCode(
        view.getUint8(offset + 4),
        view.getUint8(offset + 5),
        view.getUint8(offset + 6),
        view.getUint8(offset + 7),
      );
      if (exifHeader === "Exif") {
        return parseExif(view, offset + 10, size - 8);
      }
      offset += 2 + size;
    } else if ((marker & 0xff00) !== 0xff00) {
      break;
    } else {
      const size = view.getUint16(offset + 2);
      offset += 2 + size;
    }
  }
  return null;
}

function parseExif(view, tiffStart, length) {
  const bigEndian = view.getUint16(tiffStart) === 0x4d4d;
  const get16 = (o) => view.getUint16(o, !bigEndian);
  const get32 = (o) => view.getUint32(o, !bigEndian);

  if (get16(tiffStart + 2) !== 0x002a) return null;
  const ifd0Offset = get32(tiffStart + 4);
  const ifd0 = tiffStart + ifd0Offset;
  const numEntries = get16(ifd0);

  let exifIfdPtr = null;
  for (let i = 0; i < numEntries; i++) {
    const entry = ifd0 + 2 + i * 12;
    const tag = get16(entry);
    if (tag === 0x8769) {
      exifIfdPtr = tiffStart + get32(entry + 8);
      break;
    }
  }
  if (!exifIfdPtr) return null;

  const exifEntries = get16(exifIfdPtr);
  for (let i = 0; i < exifEntries; i++) {
    const entry = exifIfdPtr + 2 + i * 12;
    const tag = get16(entry);
    if (tag === 0x9003) {
      const valOffset = get32(entry + 8);
      const strStart = tiffStart + valOffset;
      const chars = [];
      for (let j = 0; j < 19; j++) {
        chars.push(String.fromCharCode(view.getUint8(strStart + j)));
      }
      const str = chars.join("");
      const m = str.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
      if (m) {
        return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}`;
      }
    }
  }
  return null;
}
