"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type Mode = "login" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<{ type: "idle" | "loading" | "error" | "success"; message?: string }>({
    type: "idle",
  });

  const canSubmit = useMemo(() => {
    if (!email || !password) return false;
    if (mode === "signup" && !username) return false;
    return true;
  }, [email, mode, password, username]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    if (!isSupabaseConfigured()) {
      router.push("/household");
      return;
    }

    setStatus({ type: "loading" });
    const supabase = getSupabaseBrowserClient();

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/household");
        setStatus({ type: "success" });
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      if (error) throw error;

      if (data.user?.id) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          user_id: data.user.id,
          username,
        });
        if (profileError) throw profileError;
      }

      setStatus({
        type: "success",
        message: "账号已创建。如果开启了邮箱验证，请先到邮箱完成验证后再登录。",
      });
      setMode("login");
    } catch (err) {
      const detail = err instanceof Error ? err.message : "发生错误，请稍后再试。";
      setStatus({ type: "error", message: `操作失败：${detail}` });
    }
  }

  return (
    <div className="flex min-h-full flex-1 justify-center px-4 py-10">
      <main className="w-full max-w-md">
        <Logo />

        <Card className="mt-8 p-5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={[
                "h-10 flex-1 rounded-2xl border text-[13px] font-medium transition",
                mode === "login"
                  ? "bg-[rgba(244,215,123,0.65)] border-[rgba(43,42,38,0.10)]"
                  : "bg-[rgba(255,255,255,0.55)] border-[var(--dc-border)] text-[var(--dc-muted)]",
              ].join(" ")}
            >
              登录
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={[
                "h-10 flex-1 rounded-2xl border text-[13px] font-medium transition",
                mode === "signup"
                  ? "bg-[rgba(244,215,123,0.65)] border-[rgba(43,42,38,0.10)]"
                  : "bg-[rgba(255,255,255,0.55)] border-[var(--dc-border)] text-[var(--dc-muted)]",
              ].join(" ")}
            >
              注册
            </button>
          </div>

          {!isSupabaseConfigured() ? (
            <div className="mt-5 rounded-3xl border border-[rgba(43,42,38,0.12)] bg-[rgba(244,215,123,0.30)] px-4 py-3 text-[13px] text-[var(--dc-primary-ink)]">
              Supabase 还未配置。你仍然可以用「演示模式」浏览界面。
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="mt-5 grid gap-4">
            {mode === "signup" ? (
              <Input label="用户名" value={username} onChange={(e) => setUsername(e.target.value)} />
            ) : null}
            <Input
              label="邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              inputMode="email"
              autoComplete="email"
            />
            <Input
              label="密码"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />

            {status.type === "error" ? (
              <div className="rounded-3xl border border-[rgba(43,42,38,0.12)] bg-[rgba(213,155,106,0.18)] px-4 py-3 text-[13px] text-[var(--dc-primary-ink)]">
                {status.message}
              </div>
            ) : null}
            {status.type === "success" && status.message ? (
              <div className="rounded-3xl border border-[rgba(43,42,38,0.12)] bg-[rgba(244,215,123,0.30)] px-4 py-3 text-[13px] text-[var(--dc-primary-ink)]">
                {status.message}
              </div>
            ) : null}

            <Button type="submit" disabled={!canSubmit || status.type === "loading"} className="w-full">
              {mode === "login" ? "登录" : "创建账号"}
            </Button>

            <div className="text-center text-[12px] text-[var(--dc-muted)]">
              继续即表示你同意仅上传衣服单品图（不上传人体照）。
            </div>
          </form>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/" className="text-[13px] text-[var(--dc-muted)] underline underline-offset-4">
            返回首页
          </Link>
        </div>
      </main>
    </div>
  );
}
