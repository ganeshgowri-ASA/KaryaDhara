import * as chrono from "chrono-node";

export function parseNaturalDate(text: string): Date | null {
  const results = chrono.parse(text, new Date(), { forwardDate: true });
  if (results.length > 0) {
    return results[0].start.date();
  }
  return null;
}

export function extractDateAndTitle(input: string): {
  title: string;
  dueDate: Date | null;
} {
  const results = chrono.parse(input, new Date(), { forwardDate: true });
  if (results.length > 0) {
    const match = results[0];
    const title = input.replace(match.text, "").trim();
    return { title: title || input, dueDate: match.start.date() };
  }
  return { title: input, dueDate: null };
}
