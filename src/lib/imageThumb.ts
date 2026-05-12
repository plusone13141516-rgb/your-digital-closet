/**
 * 浏览器端缩略图生成（用于提速列表加载）
 * - 生成 256/512 的 webp（如不支持则退回 jpeg）
 * - 保持比例，最长边对齐目标尺寸
 */

async function toBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (!b) reject(new Error("生成缩略图失败，请换一张图片再试。"));
        else resolve(b);
      },
      mime,
      quality,
    );
  });
}

function guessWebpSupported() {
  // 简单判断：大多数现代浏览器支持；若不支持，toBlob 仍可能返回 null，我们会 fallback
  return true;
}

export async function generateThumbnail(input: { file: File; maxSize: number }): Promise<{ file: File; width: number; height: number }> {
  const bitmap = await createImageBitmap(input.file);

  const w = bitmap.width;
  const h = bitmap.height;
  const scale = Math.min(1, input.maxSize / Math.max(w, h));
  const outW = Math.max(1, Math.round(w * scale));
  const outH = Math.max(1, Math.round(h * scale));

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("当前浏览器不支持 Canvas。");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, outW, outH);

  const baseName = input.file.name.replace(/\.[^/.]+$/, "");
  const useWebp = guessWebpSupported();

  let blob: Blob;
  let ext = "webp";
  try {
    blob = await toBlob(canvas, useWebp ? "image/webp" : "image/jpeg", 0.85);
  } catch {
    // fallback jpeg
    blob = await toBlob(canvas, "image/jpeg", 0.85);
    ext = "jpg";
  }

  const outFile = new File([blob], `${baseName}-thumb-${input.maxSize}.${ext}`, { type: blob.type });
  return { file: outFile, width: outW, height: outH };
}

export async function generateThumbs(input: { file: File }): Promise<{
  thumb256: File;
  thumb512: File;
  originalWidth: number;
  originalHeight: number;
}> {
  const bitmap = await createImageBitmap(input.file);
  const originalWidth = bitmap.width;
  const originalHeight = bitmap.height;
  // 释放 bitmap 的引用（浏览器会自行管理）

  const [t256, t512] = await Promise.all([
    generateThumbnail({ file: input.file, maxSize: 256 }),
    generateThumbnail({ file: input.file, maxSize: 512 }),
  ]);

  return { thumb256: t256.file, thumb512: t512.file, originalWidth, originalHeight };
}
