import type { Message } from "@/shared/types/chat";

export function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  const datePart = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const timePart = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${datePart}, ${timePart}`;
}

export function shouldShowDateSeparator(
  messages: Message[],
  index: number,
): boolean {
  if (index === 0) return true;
  const curr = new Date(messages[index].created_at);
  const prev = new Date(messages[index - 1].created_at);
  if (curr.toDateString() !== prev.toDateString()) return true;
  const gapMs = curr.getTime() - prev.getTime();
  return gapMs > 30 * 60 * 1000;
}

// Replaces a matching optimistic temp row with the real incoming message.
// Matches on sender + type + content/url within a 60s window.
export function reconcile(prev: Message[], incoming: Message): Message[] {
  if (prev.some((m) => m.id === incoming.id)) return prev;

  const incomingTs = new Date(incoming.created_at).getTime();
  const tempIdx = prev.findIndex((m) => {
    if (!m.id.startsWith("temp-")) return false;
    if (m.sender_id !== incoming.sender_id) return false;
    if (m.message_type !== incoming.message_type) return false;
    if (incoming.message_type === "text") {
      if ((m.content ?? "") !== (incoming.content ?? "")) return false;
    } else if (incoming.message_type === "image") {
      const a = m.metadata?.url;
      const b = incoming.metadata?.url;
      if (a && b && a !== b) return false;
    }
    const tempTs = new Date(m.created_at).getTime();
    return Math.abs(incomingTs - tempTs) < 60_000;
  });

  if (tempIdx === -1) return [...prev, incoming];
  const next = prev.slice();
  next[tempIdx] = incoming;
  return next;
}

export function isGroupedWithPrev(
  messages: Message[],
  index: number,
  showDate: boolean,
): boolean {
  const prev = index > 0 ? messages[index - 1] : null;
  if (!prev || showDate) return false;
  if (prev.sender_id !== messages[index].sender_id) return false;
  const gap =
    new Date(messages[index].created_at).getTime() -
    new Date(prev.created_at).getTime();
  return gap < 2 * 60 * 1000;
}

export function replyPreviewText(
  messageType: Message["message_type"],
  content: string | null | undefined,
): string {
  if (messageType === "image") return content || "Photo";
  if (messageType === "link_preview") return content || "Link";
  return content ?? "";
}
