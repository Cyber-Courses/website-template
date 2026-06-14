/**
 * Date normalization for JSON-LD / structured data.
 *
 * Google's Rich Results test warns when `datePublished`/`dateModified` lack a
 * timezone. Frontmatter dates are usually written date-only (`2026-04-15`), so
 * we coerce bare `YYYY-MM-DD` to full ISO 8601 at UTC midnight. Values that
 * already carry a time component are left untouched.
 */
export function toIsoDateTime(value: string): string {
  if (value.includes("T")) return value;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00+00:00` : value;
}

const SCHEMA_DATE_KEYS = new Set([
  "datePublished",
  "dateModified",
  "dateCreated",
  "uploadDate",
]);

/** Deep-walk a JSON-LD node, normalizing every date field to ISO 8601 + tz. */
export function normalizeSchemaDates<T>(node: T): T {
  if (Array.isArray(node)) {
    return node.map((n) => normalizeSchemaDates(n)) as T;
  }
  if (node && typeof node === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node)) {
      out[key] =
        SCHEMA_DATE_KEYS.has(key) && typeof value === "string"
          ? toIsoDateTime(value)
          : normalizeSchemaDates(value);
    }
    return out as T;
  }
  return node;
}
