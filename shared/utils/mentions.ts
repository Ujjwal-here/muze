const MENTION_REGEX_SRC = "@([A-Za-z0-9_.]+)";

export interface MentionSegment {
  type: "text" | "mention";

  value: string;

  raw: string;
}

export function parseMentions(input: string): MentionSegment[] {
  if (!input) return [];
  const re = new RegExp(MENTION_REGEX_SRC, "g");
  const out: MentionSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(input)) !== null) {
    const prev = match.index === 0 ? "" : input[match.index - 1];
    if (prev !== "" && !/\s/.test(prev)) continue;

    if (match.index > lastIndex) {
      const text = input.slice(lastIndex, match.index);
      out.push({ type: "text", value: text, raw: text });
    }
    out.push({ type: "mention", value: match[1], raw: match[0] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < input.length) {
    const tail = input.slice(lastIndex);
    out.push({ type: "text", value: tail, raw: tail });
  }

  if (out.length === 0) {
    out.push({ type: "text", value: input, raw: input });
  }
  return out;
}

export function extractMentionedUsernames(text: string): string[] {
  const re = new RegExp(MENTION_REGEX_SRC, "g");
  const seen = new Set<string>();
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const prev = m.index === 0 ? "" : text[m.index - 1];
    if (prev !== "" && !/\s/.test(prev)) continue;
    const lower = m[1].toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      out.push(m[1]);
    }
  }
  return out;
}
