const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Escapes a string for interpolation into an HTML template. Screens build their
 * markup as strings, so anything that isn't a literal — rule text, a search term
 * typed by the user — has to go through here before it reaches innerHTML.
 */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]!);
}
