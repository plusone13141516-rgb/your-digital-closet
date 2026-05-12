"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function getCoverScale(canvasW: number, canvasH: number, imgW: number, imgH: number) {
  return Math.max(canvasW / imgW, canvasH / imgH);
}

async function canvasToFile(canvas: HTMLCanvasElement, baseName: string): Promise<File> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (!b) reject(new Error("裁剪导出失败，请重试。"));
        else resolve(b);
      },
      "image/webp",
      0.92,
    );
  });
  return new File([blob], `${baseName}-crop-3x4.webp`, { type: blob.type });
}

export function Crop34Modal({
  file,
  open,
  onClose,
  onApply,
}: {
  file: File;
  open: boolean;
  onClose: () => void;
  onApply: (cropped: File) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [bmp, setBmp] = useState<ImageBitmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ active: boolean; x: number; y: number }>({ active: false, x: 0, y: 0 });

  const objectUrl = useMemo(() => URL.createObjectURL(file), [file]);
  const baseName = useMemo(() => file.name.replace(/\.[^/.]+$/, ""), [file.name]);

  useEffect(() => {
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  useEffect(() => {
    return () => {
      // free ImageBitmap memory
      bmp?.close();
    };
  }, [bmp]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setLoadError(null);

    let alive = true;

    // Prefer createImageBitmap (often handles EXIF orientation better); fallback to <img>.
    (async () => {
      try {
        const bitmap = await createImageBitmap(file);
        if (!alive) return;
        setBmp(bitmap);
        setImg(null);
        setLoading(false);
        setScale(1);
        setOffset({ x: 0, y: 0 });
      } catch {
        const image = new Image();
        image.onload = () => {
          if (!alive) return;
          setImg(image);
          setBmp(null);
          setLoading(false);
          setScale(1);
          setOffset({ x: 0, y: 0 });
        };
        image.onerror = () => {
          if (!alive) return;
          setImg(null);
          setBmp(null);
          setLoading(false);
          setLoadError("图片格式可能不受浏览器支持（常见于 HEIC）。请换成 JPG/PNG/WebP 再试。");
        };
        image.src = objectUrl;
      }
    })();

    return () => {
      alive = false;
    };
  }, [objectUrl, open]);

  function clampOffset(next: { x: number; y: number }, canvasW: number, canvasH: number, drawW: number, drawH: number) {
    const baseX = (canvasW - drawW) / 2;
    const baseY = (canvasH - drawH) / 2;
    const minOriginX = canvasW - drawW;
    const maxOriginX = 0;
    const minOriginY = canvasH - drawH;
    const maxOriginY = 0;
    const originX = clamp(baseX + next.x, minOriginX, maxOriginX);
    const originY = clamp(baseY + next.y, minOriginY, maxOriginY);
    return { x: originX - baseX, y: originY - baseY };
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const src = bmp ?? img;
    if (!src) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const srcW = src instanceof ImageBitmap ? src.width : src.naturalWidth;
    const srcH = src instanceof ImageBitmap ? src.height : src.naturalHeight;
    const cover = getCoverScale(cw, ch, srcW, srcH);
    const drawW = srcW * cover * scale;
    const drawH = srcH * cover * scale;

    const clamped = clampOffset(offset, cw, ch, drawW, drawH);
    if (clamped.x !== offset.x || clamped.y !== offset.y) setOffset(clamped);

    const x = (cw - drawW) / 2 + clamped.x;
    const y = (ch - drawH) / 2 + clamped.y;

    ctx.clearRect(0, 0, cw, ch);
    ctx.fillStyle = "rgba(255,255,255,0)";
    ctx.fillRect(0, 0, cw, ch);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(src as any, x, y, drawW, drawH);

    // guideline frame
    ctx.strokeStyle = "rgba(43,42,38,0.18)";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, cw - 2, ch - 2);
  }

  useEffect(() => {
    if (!open) return;
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, img, bmp, scale, offset.x, offset.y]);

  function onPointerDown(e: React.PointerEvent) {
    dragRef.current = { active: true, x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    dragRef.current = { ...dragRef.current, x: e.clientX, y: e.clientY };
    setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  }
  function onPointerUp() {
    dragRef.current.active = false;
  }

  async function applyCrop() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const out = document.createElement("canvas");
    out.width = 768;
    out.height = 1024; // 3:4
    const ctx = out.getContext("2d");
    const src = bmp ?? img;
    if (!ctx || !src) return;

    const srcW = src instanceof ImageBitmap ? src.width : src.naturalWidth;
    const srcH = src instanceof ImageBitmap ? src.height : src.naturalHeight;
    const cover = getCoverScale(out.width, out.height, srcW, srcH);
    const drawW = srcW * cover * scale;
    const drawH = srcH * cover * scale;
    const clamped = clampOffset(offset, out.width, out.height, drawW, drawH);
    const x = (out.width - drawW) / 2 + clamped.x;
    const y = (out.height - drawH) / 2 + clamped.y;

    ctx.clearRect(0, 0, out.width, out.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(src as any, x, y, drawW, drawH);

    const cropped = await canvasToFile(out, baseName);
    onApply(cropped);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(0,0,0,0.35)] p-4">
      <Card className="w-full max-w-md p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[14px] font-semibold">裁剪为 3:4</div>
          <Button size="sm" variant="ghost" onClick={onClose}>
            关闭
          </Button>
        </div>

        <div className="mt-4 grid gap-3">
          <div className="text-[12px] text-[var(--dc-muted)]">拖拽调整位置，滑动缩放（竖屏 3:4）。</div>

          <div className="rounded-3xl border border-[var(--dc-border)] bg-[rgba(255,255,255,0.65)] p-3">
            <div className="mx-auto w-[270px]">
              <div className="relative w-full overflow-hidden rounded-3xl bg-[rgba(255,255,255,0.75)]" style={{ aspectRatio: "3 / 4" }}>
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={800}
                  className="absolute inset-0 h-full w-full touch-none"
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                />
                {loading ? <div className="absolute inset-0 grid place-items-center text-[12px] text-[var(--dc-muted)]">加载中…</div> : null}
                {loadError ? (
                  <div className="absolute inset-0 grid place-items-center px-6 text-center text-[12px] leading-6 text-[var(--dc-muted)]">
                    {loadError}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between text-[12px] text-[var(--dc-muted)]">
              <span>缩放</span>
              <span>{scale.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" onClick={onClose}>
              跳过
            </Button>
            <Button onClick={applyCrop} disabled={!img && !bmp}>
              应用裁剪
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
