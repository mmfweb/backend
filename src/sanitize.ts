/** Evita inyección de cabeceras (CRLF) en correo y campos de texto. */
export function stripControlChars(value: string): string {
  return value.replace(/[\0-\x1f\x7f]/g, " ").trim();
}

export function sanitizeEmailHeaderValue(value: string, maxLen: number): string {
  return stripControlChars(value).slice(0, maxLen);
}

export function isSafeHttpsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}
