/**
 * Images are stored inline as data URLs in database rows, so a raw 8MB phone
 * photo becomes a ~11MB request that often fails (or times out) on save.
 * This downsizes + re-encodes uploads in the browser before they are used,
 * and turns every failure into a message the vendor can understand.
 */

export interface OptimizeOptions {
  /** Longest edge in pixels after resizing. */
  maxDimension?: number;
  /** JPEG/WEBP quality 0-1. */
  quality?: number;
  /** Hard cap on the original file in MB (checked before decoding). */
  maxFileMb?: number;
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('The file could not be read.'));
    };
    reader.onerror = () => reject(new Error('The browser could not read this file. Try a different image.'));
    reader.onabort = () => reject(new Error('Reading the file was cancelled.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error('This file is not a valid image or is corrupted. Try re-saving it as JPG or PNG.'));
    img.src = src;
  });
}

export async function fileToOptimizedDataUrl(file: File, opts: OptimizeOptions = {}): Promise<string> {
  const { maxDimension = 1600, quality = 0.85, maxFileMb = 25 } = opts;
  const name = file.name || 'image';

  if (!ACCEPTED.includes(file.type)) {
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (ext === 'heic' || ext === 'heif' || file.type === 'image/heic' || file.type === 'image/heif') {
      throw new Error(`"${name}" is a HEIC photo, which browsers cannot display. Export it as JPG or PNG and try again.`);
    }
    throw new Error(`"${name}" is not a supported image type. Use JPG, PNG, WEBP or SVG.`);
  }

  const sizeMb = file.size / (1024 * 1024);
  if (sizeMb > maxFileMb) {
    throw new Error(`"${name}" is ${sizeMb.toFixed(1)}MB — too large to process. Choose a file under ${maxFileMb}MB.`);
  }

  const original = await readAsDataUrl(file);

  // SVG/GIF: keep as-is (re-encoding would flatten them).
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return original;

  let img: HTMLImageElement;
  try {
    img = await loadImage(original);
  } catch (e) {
    throw new Error(`"${name}": ${(e as Error).message}`);
  }

  const { naturalWidth: w, naturalHeight: h } = img;
  if (!w || !h) throw new Error(`"${name}" has no readable image data.`);

  const scale = Math.min(1, maxDimension / Math.max(w, h));
  // Already small enough in both pixels and bytes: keep the original untouched.
  if (scale === 1 && file.size < 400 * 1024) return original;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return original;

  // PNG may carry transparency: keep it PNG unless it is a photo-sized file.
  const keepAlpha = file.type === 'image/png' && file.size < 1.5 * 1024 * 1024;
  if (!keepAlpha) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const out = keepAlpha ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', quality);
  // If re-encoding somehow made it bigger, prefer the original.
  return out.length < original.length ? out : original;
}

/** Rough size in MB of a data URL's payload, for showing "this image is X MB". */
export function dataUrlSizeMb(dataUrl: string): number {
  const comma = dataUrl.indexOf(',');
  const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  return (b64.length * 3) / 4 / (1024 * 1024);
}
