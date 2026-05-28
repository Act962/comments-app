import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function splitText(text: string, maxLength: number): string[] {
  const result: string[] = [];
  let currentText = text;

  while (currentText.length > 0) {
    if (currentText.length <= maxLength) {
      result.push(currentText);
      break;
    }

    let splitIndex = currentText.lastIndexOf("\n", maxLength);
    if (splitIndex === -1) {
      splitIndex = currentText.lastIndexOf(" ", maxLength);
    }

    if (splitIndex === -1 || splitIndex === 0) {
      splitIndex = maxLength;
    }

    result.push(currentText.slice(0, splitIndex).trim());
    currentText = currentText.slice(splitIndex).trim();
  }

  return result;
}

const utf8 = (s: string) => Buffer.byteLength(s, "utf8");

/**
 * Truncate a string so its UTF-8 byte length does not exceed `maxBytes`.
 * Iterates by code points so surrogate pairs (emojis) are never split.
 */
export function truncateToBytes(text: string, maxBytes: number): string {
  if (utf8(text) <= maxBytes) return text;
  let bytes = 0;
  let out = "";
  for (const ch of text) {
    const chBytes = utf8(ch);
    if (bytes + chBytes > maxBytes) break;
    bytes += chBytes;
    out += ch;
  }
  return out;
}

/**
 * Split a string into chunks each within `maxBytes` UTF-8 bytes. Prefers
 * breaking at newlines or spaces; falls back to a hard cut on the last
 * fitting code point boundary. Safe for accents and emojis.
 *
 * Use for Instagram messages — Meta's `/me/messages` text limit is 1000
 * BYTES (not characters), so a Portuguese message with accents/emojis
 * silently gets truncated when split by character length.
 */
export function splitTextByBytes(text: string, maxBytes: number): string[] {
  const result: string[] = [];
  let remaining = text.trim();

  while (remaining.length > 0) {
    if (utf8(remaining) <= maxBytes) {
      result.push(remaining);
      break;
    }

    let bytes = 0;
    let charsConsumed = 0;
    let lastBreakChars = 0;

    for (const ch of remaining) {
      const chBytes = utf8(ch);
      if (bytes + chBytes > maxBytes) break;
      bytes += chBytes;
      charsConsumed += ch.length;
      if (ch === "\n" || ch === " ") {
        lastBreakChars = charsConsumed;
      }
    }

    const cutAt = lastBreakChars > 0 ? lastBreakChars : charsConsumed;
    result.push(remaining.slice(0, cutAt).trim());
    remaining = remaining.slice(cutAt).trim();
  }

  return result;
}
