// JSON.stringify does not escape "<", so a value containing the literal text
// "</script>" (e.g. a member's self-chosen fullName, or a ride title) closes
// this script tag early and lets whatever follows execute as real markup —
// a stored-XSS vector. Escaping "<" is the standard, sufficient fix.
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
