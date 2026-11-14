import neo4j from "neo4j-driver";

export function bindIntegers(value: unknown): unknown {
  if (typeof value === "number") {
    return Number.isSafeInteger(value) ? neo4j.int(value) : value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => bindIntegers(item));
  }

  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      out[key] = bindIntegers(item);
    }
    return out;
  }

  return value;
}
