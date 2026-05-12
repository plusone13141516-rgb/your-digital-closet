type Area = { x: number; y: number; width: number; height: number };

async function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export async function cropImageToBlob(input: { imageUrl: string; crop: Area; mimeType?: string }): Promise<Blob> {
  const image = await loadImage(input.imageUrl);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("当前浏览器不支持 Canvas。");

  canvas.width = Math.max(1, Math.floor(input.crop.width));
  canvas.height = Math.max(1, Math.floor(input.crop.height));

  ctx.drawImage(
    image,
    input.crop.x,
    input.crop.y,
    input.crop.width,
    input.crop.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  const mime = input.mimeType ?? "image/jpeg";
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("裁剪失败，请重试。"));
      else resolve(blob);
    }, mime);
  });
}
