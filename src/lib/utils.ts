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
