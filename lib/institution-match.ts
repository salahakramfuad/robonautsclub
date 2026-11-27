/** Type-ahead matching for school / university names (pure, client-safe). */

export const MAX_SUGGESTIONS = 8
const MIN_CHARS = 2

export function normalizeInstitution(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export type InstitutionMatch = { name: string; score: number; start: number; end: number }

/**
 * Rank: whole name starts with the query, then a word starts with it, then it appears
 * anywhere, then every typed word appears somewhere (e.g. "aga khan" → "The Aga Khan School").
 */
export function findInstitutionMatches(query: string, options: string[]): InstitutionMatch[] {
  const q = normalizeInstitution(query)
  if (q.length < MIN_CHARS) return []
  const tokens = q.split(' ')
  const matches: InstitutionMatch[] = []
  for (const name of options) {
    const n = normalizeInstitution(name)
    let score = -1
    if (n.startsWith(q)) score = 0
    else if (n.includes(` ${q}`)) score = 1
    else if (n.includes(q)) score = 2
    else if (tokens.every((tok) => n.includes(tok))) score = 3
    if (score < 0) continue
    // Highlight the first typed word in the original (case-preserved) name.
    const at = name.toLowerCase().indexOf(tokens[0])
    matches.push({ name, score, start: at, end: at >= 0 ? at + tokens[0].length : -1 })
  }
  return matches
    .sort((a, b) => a.score - b.score || a.name.length - b.name.length || a.name.localeCompare(b.name))
    .slice(0, MAX_SUGGESTIONS)
}
