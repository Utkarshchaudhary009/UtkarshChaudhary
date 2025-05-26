import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

function simulateDelay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Master function to handle the flow
export async function WaitForAudio(text: string) {
  const conversationLength = text.length;
  const delayToConvert = conversationLength * 50;
  const delayToSave = conversationLength * 5;
  const delayToUpload = conversationLength * 10;

  await simulateDelay(delayToConvert);
  await simulateDelay(delayToSave);
  await simulateDelay(delayToUpload);
}