import neo4j from 'neo4j-driver';

export function neo4jSerialize(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (neo4j.isInt(value)) {
    if (!neo4j.integer.inSafeRange(value)) {
      return value.toString();
    }
    return neo4j.integer.toNumber(value);
  }

  if (neo4j.isNode(value)) {
    return {
      labels: value.labels,
      properties: serializeProperties(value.properties)
    };
  }

  if (neo4j.isRelationship(value)) {
    return {
      type: value.type,
      start: neo4jSerialize(value.start),
      end: neo4jSerialize(value.end),
      properties: serializeProperties(value.properties)
    };
  }

  if (neo4j.isPath(value)) {
    return {
      start: neo4jSerialize(value.start),
      end: neo4jSerialize(value.end),
      segments: value.segments.map((segment) => ({
        start: neo4jSerialize(segment.start),
        relationship: neo4jSerialize(segment.relationship),
        end: neo4jSerialize(segment.end)
      }))
    };
  }

  if (
    neo4j.isDate(value) ||
    neo4j.isDateTime(value) ||
    neo4j.isLocalDateTime(value) ||
    neo4j.isLocalTime(value) ||
    neo4j.isTime(value) ||
    neo4j.isDuration(value)
  ) {
    return value.toString();
  }

  if (neo4j.isPoint(value)) {
    return {
      srid: neo4jSerialize(value.srid),
      x: neo4jSerialize(value.x),
      y: neo4jSerialize(value.y),
      z: value.z === undefined ? undefined : neo4jSerialize(value.z)
    };
  }

  if (Array.isArray(value)) {
    return value.map((item) => neo4jSerialize(item));
  }

  if (typeof value === 'object') {
    return serializeProperties(value as Record<string, unknown>);
  }

  return value;
}

function serializeProperties(properties: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(properties)) {
    out[key] = neo4jSerialize(val);
  }
  return out;
}
