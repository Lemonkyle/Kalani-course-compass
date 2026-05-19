// URL safety helpers.

export function safeExternalUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
