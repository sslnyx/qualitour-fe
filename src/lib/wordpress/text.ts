const NAMED_ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&#039;': "'",
  '&ndash;': '–',
  '&mdash;': '—',
  '&hellip;': '…',
  '&lsquo;': '‘',
  '&rsquo;': '’',
  '&ldquo;': '“',
  '&rdquo;': '”',
};

function decodeHtmlEntities(input: string): string {
  let value = input;

  // Named entities (common subset)
  for (const [entity, char] of Object.entries(NAMED_ENTITIES)) {
    value = value.split(entity).join(char);
  }

  // Numeric decimal entities
  value = value.replace(/&#(\d+);/g, (_, dec: string) => {
    const codePoint = Number(dec);
    if (!Number.isFinite(codePoint)) return _;
    try {
      return String.fromCodePoint(codePoint);
    } catch {
      return _;
    }
  });

  // Numeric hex entities
  value = value.replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => {
    const codePoint = Number.parseInt(hex, 16);
    if (!Number.isFinite(codePoint)) return _;
    try {
      return String.fromCodePoint(codePoint);
    } catch {
      return _;
    }
  });

  return value;
}

function stripHtmlTags(input: string): string {
  // This is for small text fields (term names, titles). Not for post content.
  return input.replace(/<[^>]*>/g, '');
}

export function normalizeWpText(input: unknown): string {
  if (typeof input !== 'string') return '';
  const stripped = stripHtmlTags(input);
  const decoded = decodeHtmlEntities(stripped);
  return decoded.trim();
}
