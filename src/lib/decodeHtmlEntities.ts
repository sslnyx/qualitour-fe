const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

function decodeNumericEntity(entity: string): string {
  // entity is like "&#123;" or "&#x1F600;"
  const isHex = entity.startsWith('&#x') || entity.startsWith('&#X');
  const num = entity
    .replace(/^&#x/i, '')
    .replace(/^&#/, '')
    .replace(/;$/, '');

  const codePoint = Number.parseInt(num, isHex ? 16 : 10);
  if (!Number.isFinite(codePoint) || codePoint <= 0) return entity;

  try {
    return String.fromCodePoint(codePoint);
  } catch {
    return entity;
  }
}

/**
 * Decodes common HTML entities from WordPress strings (e.g. "Tickets &amp; Passes").
 * Safe for Server/Client usage (no DOM dependency).
 */
export function decodeHtmlEntities(input: string): string {
  if (!input) return input;

  return input
    // Numeric entities: &#123; and &#x1F600;
    .replace(/&#x[0-9a-fA-F]+;|&#\d+;/g, (m) => decodeNumericEntity(m))
    // Named entities we care about
    .replace(/&[a-zA-Z]+;/g, (m) => {
      const name = m.slice(1, -1);
      return NAMED_ENTITIES[name] ?? m;
    });
}
