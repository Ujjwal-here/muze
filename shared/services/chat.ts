import { supabase } from "@/shared/lib/supabase";
import type {
  InboxItem,
  Message,
  MessageType,
  Profile,
} from "@/shared/types/chat";

export async function fetchInbox(userId: string): Promise<InboxItem[]> {
  const { data, error } = await supabase
    .from("inbox_view")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  let items: InboxItem[];
  if (error) {
    items = await fetchInboxManual(userId);
  } else {
    items = (data as InboxItem[]) ?? [];
  }

  const seen = new Set<string>();
  items = items.filter((item) => {
    if (seen.has(item.conversation_id)) return false;
    seen.add(item.conversation_id);
    return true;
  });

  return enrichWithUnreadCounts(items, userId);
}

async function enrichWithUnreadCounts(
  items: InboxItem[],
  userId: string,
): Promise<InboxItem[]> {
  if (items.length === 0) return [];

  const convoIds = items.map((i) => i.conversation_id);
  const { data: participations } = await supabase
    .from("conversation_participants")
    .select("conversation_id, last_read_at")
    .eq("user_id", userId)
    .in("conversation_id", convoIds);

  const lastReadMap = new Map(
    (participations ?? []).map((p) => [p.conversation_id, p.last_read_at]),
  );

  const { data: unreadRows } = await supabase
    .from("messages")
    .select("id, conversation_id, created_at, sender_id")
    .in("conversation_id", convoIds)
    .neq("sender_id", userId);

  const countMap = new Map<string, number>();
  for (const row of unreadRows ?? []) {
    const lastRead = lastReadMap.get(row.conversation_id);
    if (lastRead && new Date(row.created_at) <= new Date(lastRead)) continue;
    countMap.set(
      row.conversation_id,
      (countMap.get(row.conversation_id) ?? 0) + 1,
    );
  }

  return items.map((i) => {
    const lastRead = lastReadMap.get(i.conversation_id) ?? null;
    const unread_count = countMap.get(i.conversation_id) ?? 0;

    const lastMsgSender = i.last_message_sender_id;
    const has_unread = lastMsgSender !== userId && unread_count > 0;

    return {
      ...i,
      last_read_at: lastRead ?? i.last_read_at,
      unread_count: has_unread ? unread_count : 0,
      has_unread,
    };
  });
}

async function fetchInboxManual(userId: string): Promise<InboxItem[]> {
  const { data: participations, error: pErr } = await supabase
    .from("conversation_participants")
    .select("conversation_id, last_read_at")
    .eq("user_id", userId);

  if (pErr || !participations?.length) return [];

  const convoIds = participations.map((p) => p.conversation_id);
  const lastReadMap = Object.fromEntries(
    participations.map((p) => [p.conversation_id, p.last_read_at]),
  );

  const { data: otherParticipants } = await supabase
    .from("conversation_participants")
    .select(
      "conversation_id, user_id, profiles:user_id(id, username, full_name, avatar_url)",
    )
    .in("conversation_id", convoIds)
    .neq("user_id", userId);

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, updated_at")
    .in("id", convoIds)
    .order("updated_at", { ascending: false });

  const inboxItems: InboxItem[] = [];

  for (const convo of conversations ?? []) {
    const { data: lastMsg } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convo.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const other = otherParticipants?.find(
      (op) => op.conversation_id === convo.id,
    );
    const profile = other?.profiles as any;

    if (profile) {
      const lastRead = lastReadMap[convo.id] ?? null;

      let has_unread = false;
      if (lastMsg && lastMsg.sender_id !== userId) {
        if (!lastRead) {
          has_unread = true;
        } else {
          has_unread = new Date(lastMsg.created_at) > new Date(lastRead);
        }
      }

      inboxItems.push({
        conversation_id: convo.id,
        updated_at: convo.updated_at,
        other_user_id: profile.id,
        other_username: profile.username,
        other_full_name: profile.full_name,
        other_avatar_url: profile.avatar_url,
        last_message_content: lastMsg?.content ?? null,
        last_message_type: lastMsg?.message_type ?? "text",
        last_message_metadata: lastMsg?.metadata ?? null,
        last_message_at: lastMsg?.created_at ?? null,
        last_message_sender_id: lastMsg?.sender_id ?? null,
        last_read_at: lastRead,
        has_unread,
      } as InboxItem);
    }
  }

  return inboxItems;
}

export async function fetchMessages(
  conversationId: string,
  limit = 50,
  before?: string,
): Promise<Message[]> {
  let query = supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (before) {
    query = query.lt("created_at", before);
  }

  const { data, error } = await query;
  if (error) throw error;

  return ((data as Message[]) ?? []).reverse();
}

export async function sendMessage(
  conversationId: string,
  content: string,
  messageType: MessageType = "text",
  metadata: Record<string, any> = {},
): Promise<Message> {
  const { data: messageId, error: rpcError } = await supabase.rpc(
    "send_message",
    {
      p_conversation_id: conversationId,
      p_content: content,
      p_message_type: messageType,
      p_metadata: metadata,
    },
  );

  if (rpcError) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user!.id,
        content,
        message_type: messageType,
        metadata,
      })
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    return data as Message;
  }

  const { data: msg, error: fetchErr } = await supabase
    .from("messages")
    .select("*")
    .eq("id", messageId)
    .single();

  if (fetchErr) throw fetchErr;
  return msg as Message;
}

export async function getOrCreateDM(otherUserId: string): Promise<string> {
  const { data, error } = await supabase.rpc("get_or_create_dm", {
    other_user_id: otherUserId,
  });

  if (error) throw error;
  return data as string;
}

export async function getLastReadAt(
  conversationId: string,
  userId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("conversation_participants")
    .select("last_read_at")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return (data as { last_read_at: string | null }).last_read_at;
}

export async function markAsRead(
  conversationId: string,
  userId: string,
): Promise<string | null> {
  const nowIso = new Date(Date.now() + 2000).toISOString();

  const { data, error } = await supabase
    .from("conversation_participants")
    .update({ last_read_at: nowIso })
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .select("last_read_at");

  if (error) throw error;

  if (!data || data.length === 0) {
    console.warn(
      "[markAsRead] 0 rows updated for conversation",
      conversationId,
      "- check RLS policies on conversation_participants.",
    );
    return null;
  }

  return (data[0] as { last_read_at: string }).last_read_at;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data as Profile;
}

export async function searchProfiles(query: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
    .limit(20);

  if (error) return [];
  return (data as Profile[]) ?? [];
}

const MESSAGES_POLL_MS = 2000;
const INBOX_POLL_MS = 3000;

export function subscribeToMessages(
  conversationId: string,
  onNewMessage: (message: Message) => void,
): () => void {
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastSeenAt: string | null = null;
  let inFlight = false;

  const tick = async () => {
    if (cancelled || inFlight) {
      schedule();
      return;
    }
    inFlight = true;
    try {
      let query = supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (lastSeenAt) {
        query = query.gt("created_at", lastSeenAt);
      } else {
        query = query.limit(1).order("created_at", { ascending: false });
      }

      const { data, error } = await query;
      if (!error && data && !cancelled) {
        const rows = data as Message[];
        if (lastSeenAt == null && rows.length > 0) {
          lastSeenAt = rows[0].created_at;
        } else {
          const ordered = [...rows].sort((a, b) =>
            a.created_at.localeCompare(b.created_at),
          );
          for (const row of ordered) {
            onNewMessage(row);
            if (!lastSeenAt || row.created_at > lastSeenAt) {
              lastSeenAt = row.created_at;
            }
          }
        }
      }
    } catch {
    } finally {
      inFlight = false;
      schedule();
    }
  };

  const schedule = () => {
    if (cancelled) return;
    timer = setTimeout(tick, MESSAGES_POLL_MS);
  };

  tick();

  return () => {
    cancelled = true;
    if (timer) clearTimeout(timer);
  };
}

export function subscribeToInbox(
  userId: string,
  onUpdate: () => void,
): () => void {
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const tick = () => {
    if (cancelled) return;
    try {
      onUpdate();
    } catch {}
    timer = setTimeout(tick, INBOX_POLL_MS);
  };

  timer = setTimeout(tick, INBOX_POLL_MS);

  return () => {
    cancelled = true;
    if (timer) clearTimeout(timer);
  };
}
