/**
 * Downscale + re-encode an image file before it goes into the blob store, so a
 * 5 MB phone photo becomes ~200–400 KB. Keeps IndexedDB (and a future Supabase
 * Storage bill) sane. Uses a plain <canvas> for Safari compatibility.
 */
export async function downscaleImage(
  file: File | Blob,
  maxDim = 2000,
  quality = 0.82,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  const { width, height } = bitmap ?? (await probeViaImg(file));
  const scale = Math.min(1, maxDim / Math.max(width, height));
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file instanceof Blob ? file : new Blob([file]);

  if (bitmap) {
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
  } else {
    const img = await loadImg(file);
    ctx.drawImage(img, 0, 0, w, h);
  }

  return new Promise<Blob>((resolve) => {
    canvas.toBlob(
      (b) => resolve(b ?? (file instanceof Blob ? file : new Blob([file]))),
      "image/jpeg",
      quality,
    );
  });
}

function loadImg(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

async function probeViaImg(file: File | Blob) {
  const img = await loadImg(file);
  return { width: img.naturalWidth, height: img.naturalHeight };
}
