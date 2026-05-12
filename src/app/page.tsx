import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 justify-center px-4 py-10">
      <main className="w-full max-w-md">
        <Logo />

        <div className="mt-8">
          <h1 className="font-[family-name:var(--font-display)] text-[40px] leading-[1.05] tracking-tight">
            你的衣橱，
            <br />
            轻松变得有序。
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-[var(--dc-muted)]">
            只上传衣服单品图——不需要自拍、也不需要身体数据。你可以用自己的衣服快速获得穿搭灵感。
          </p>

          <div className="mt-7 grid gap-3">
            <Link href="/auth">
              <Button className="w-full">开始使用</Button>
            </Link>
            <Link href="/household">
              <Button className="w-full" variant="ghost">
                打开设置
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4">
          <Card className="p-5">
            <div className="text-[14px] font-semibold">隐私优先</div>
            <div className="mt-1 text-[13px] leading-6 text-[var(--dc-muted)]">
              不做人脸识别、不上传人体照。只保存你选择的衣服单品图。
            </div>
          </Card>
          <Card className="p-5">
            <div className="text-[14px] font-semibold">手机上传</div>
            <div className="mt-1 text-[13px] leading-6 text-[var(--dc-muted)]">
              拍照或从相册选择，系统自动识别分类/颜色/标签，你也可以手动调整。
            </div>
          </Card>
          <Card className="p-5">
            <div className="text-[14px] font-semibold">搭配灵感</div>
            <div className="mt-1 text-[13px] leading-6 text-[var(--dc-muted)]">
              自由搭配或趋势搭配，一键保存你喜欢的穿搭。
            </div>
          </Card>
        </div>

        <div className="mt-10 text-center text-[12px] text-[var(--dc-muted)]">
          手机优先设计 · 温柔黄色系 · 圆角卡片 · 快速决策
        </div>
      </main>
    </div>
  );
}
