// 生成 UUID v4（兼容不支持 crypto.randomUUID 的环境，例如非安全上下文的局域网 IP 预览）
export function uuidv4(): string {
  const c = globalThis.crypto as Crypto | undefined;

  if (c && "randomUUID" in c && typeof (c as Crypto & { randomUUID: () => string }).randomUUID === "function") {
    return (c as Crypto & { randomUUID: () => string }).randomUUID();
  }

  // RFC4122 v4 fallback（使用 getRandomValues）
  if (c && typeof c.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    c.getRandomValues(bytes);
    // version 4
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    // variant 10xx
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0"));
    return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex
      .slice(8, 10)
      .join("")}-${hex.slice(10, 16).join("")}`;
  }

  // 最后兜底：不保证强随机，但可用于 demo/local 状态
  const rand = () => Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0");
  return `${rand().slice(0, 8)}-${rand().slice(0, 4)}-4${rand().slice(0, 3)}-a${rand().slice(0, 3)}-${rand()}${rand().slice(0, 4)}`;
}

