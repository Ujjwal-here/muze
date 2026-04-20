import { supabase } from "@/shared/lib/supabase";
import type {
  Post,
  PostWithMeta,
  PostThread,
  CreatePostPayload,
  RepostPayload,
  QuotePostPayload,
  FeedParams,
} from "@/shared/types/post";

const POST_SELECT = `
  *,
  author:profiles!user_id (
    id, username, full_name, avatar_url
  ),
  is_liked:post_reactions!left (
    id, user_id
  )
`;

const ORIGINAL_POST_SELECT = `
  *,
  author:profiles!user_id (
    id, username, full_name, avatar_url
  )
`;

const viewedPostIds = new Set<string>();

function normalise(raw: any, userId?: string): PostWithMeta {
  if (!raw) return raw;

  const reactions = Array.isArray(raw.is_liked) ? raw.is_liked : [];
  const isLiked = userId
    ? reactions.some((r: any) => r.user_id === userId)
    : reactions.length > 0;

  // Supabase returns to-one joins as arrays — unwrap safely
  const author = Array.isArray(raw.author)
    ? (raw.author[0] ?? null)
    : (raw.author ?? null);

  const rawOriginal = Array.isArray(raw.original_post)
    ? (raw.original_post[0] ?? null)
    : (raw.original_post ?? null);

  const original = rawOriginal ? normalise(rawOriginal, userId) : null;

  return {
    ...raw,
    author,
    is_liked: isLiked,
    is_reposted: false,
    original_post: original,
  };
}

// Fetch original posts separately and merge — avoids self-join FK ambiguity
async function enrichWithOriginalPosts(
  posts: PostWithMeta[],
): Promise<PostWithMeta[]> {
  const ids = posts
    .filter((p) => p.original_post_id && !p.original_post)
    .map((p) => p.original_post_id as string);

  if (!ids.length) return posts;

  const { data } = await supabase
    .from("posts")
    .select(ORIGINAL_POST_SELECT)
    .in("id", ids);

  if (!data || !data.length) return posts;

  const originalMap = new Map<string, PostWithMeta>();
  for (const row of data) {
    const norm = normalise(row);
    originalMap.set(norm.id, norm);
  }

  return posts.map((p) => {
    if (p.original_post_id && !p.original_post) {
      return {
        ...p,
        original_post: originalMap.get(p.original_post_id) ?? null,
      };
    }
    return p;
  });
}

async function enrichWithRepostStatus(
  posts: PostWithMeta[],
  userId: string,
): Promise<PostWithMeta[]> {
  const originalIds = posts.map((p) => p.id);
  if (!originalIds.length) return posts;

  const { data } = await supabase
    .from("posts")
    .select("original_post_id")
    .eq("user_id", userId)
    .eq("post_type", "repost")
    .in("original_post_id", originalIds);

  const repostedSet = new Set((data ?? []).map((r) => r.original_post_id));

  return posts.map((p) => ({ ...p, is_reposted: repostedSet.has(p.id) }));
}

export async function fetchFeed(
  userId: string,
  { feed_type = "following", limit = 20, before }: FeedParams = {},
): Promise<PostWithMeta[]> {
  let query = supabase
    .from("posts")
    .select(POST_SELECT)
    .is("parent_post_id", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (before) {
    query = query.lt("created_at", before);
  }

  if (feed_type === "following") {
    const { data: followed } = await supabase
      .from("follows")
      .select("followed_id")
      .eq("follower_id", userId);

    const ids = [userId, ...(followed ?? []).map((f) => f.followed_id)];
    query = query.in("user_id", ids);
  }

  const { data, error } = await query;
  if (error) throw error;

  const posts = (data ?? []).map((r) => normalise(r, userId));
  const withOriginals = await enrichWithOriginalPosts(posts);
  return enrichWithRepostStatus(withOriginals, userId);
}

export async function fetchUserPosts(
  profileUserId: string,
  userId: string,
  { limit = 20, before }: { limit?: number; before?: string } = {},
): Promise<PostWithMeta[]> {
  let query = supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("user_id", profileUserId)
    .is("parent_post_id", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (before) query = query.lt("created_at", before);

  const { data, error } = await query;
  if (error) throw error;

  const posts = (data ?? []).map((r) => normalise(r, userId));
  const withOriginals = await enrichWithOriginalPosts(posts);
  return enrichWithRepostStatus(withOriginals, userId);
}

export async function fetchPost(
  postId: string,
  userId?: string,
): Promise<PostWithMeta | null> {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("id", postId)
    .single();

  if (error) return null;

  const post = normalise(data, userId);
  const [withOriginal] = await enrichWithOriginalPosts([post]);
  if (!userId) return withOriginal;

  if (!viewedPostIds.has(postId)) {
    viewedPostIds.add(postId);
    supabase.rpc("increment_view", { p_post_id: postId }).then(() => {});
  }

  const [enriched] = await enrichWithRepostStatus([withOriginal], userId);
  return enriched;
}

export async function fetchPostThread(
  postId: string,
  userId?: string,
): Promise<PostThread> {
  const post = await fetchPost(postId, userId);
  if (!post) throw new Error("Post not found");

  const { data: repliesData } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("parent_post_id", postId)
    .order("created_at", { ascending: true })
    .limit(50);

  let replies = (repliesData ?? []).map((r) =>
    normalise(r, userId),
  ) as PostWithMeta[];

  replies = await enrichWithOriginalPosts(replies);
  if (userId) {
    replies = await enrichWithRepostStatus(replies, userId);
  }

  const parent_chain: PostWithMeta[] = [];
  let cursor: string | null | undefined = post.parent_post_id;
  let depth = 0;

  while (cursor && depth < 5) {
    const parent = await fetchPost(cursor, userId);
    if (!parent) break;
    parent_chain.unshift(parent);
    cursor = parent.parent_post_id;
    depth++;
  }

  return { parent_chain, post, replies };
}

export async function createPost(
  userId: string,
  payload: CreatePostPayload,
): Promise<PostWithMeta> {
  const { data, error } = await supabase
    .from("posts")
    .insert({
      user_id: userId,
      content: payload.content ?? null,
      media_urls: payload.media_urls ?? null,
      post_type: "original",
      parent_post_id: payload.parent_post_id ?? null,
    })
    .select(POST_SELECT)
    .single();

  if (error) throw error;
  const post = normalise(data, userId);
  const [enriched] = await enrichWithRepostStatus([post], userId);
  return enriched;
}

export async function toggleLike(
  postId: string,
): Promise<{ liked: boolean; likes_count: number }> {
  const { data: liked, error } = await supabase.rpc("toggle_like", {
    p_post_id: postId,
  });

  if (error) throw error;

  const { data: post } = await supabase
    .from("posts")
    .select("likes_count")
    .eq("id", postId)
    .single();

  return { liked: liked as boolean, likes_count: post?.likes_count ?? 0 };
}

export async function repost(
  payload: RepostPayload,
): Promise<{ id: string; already_reposted: boolean }> {
  const { data: id, error } = await supabase.rpc("repost", {
    p_original_post_id: payload.original_post_id,
  });

  if (error) throw error;

  return { id: id as string, already_reposted: false };
}

export async function undoRepost(originalPostId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("undo_repost", {
    p_original_post_id: originalPostId,
  });

  if (error) throw error;
  return data as boolean;
}

export async function quotePost(
  userId: string,
  payload: QuotePostPayload,
): Promise<PostWithMeta> {
  const { data, error } = await supabase
    .from("posts")
    .insert({
      user_id: userId,
      content: null,
      media_urls: payload.media_urls ?? null,
      post_type: "quote",
      original_post_id: payload.original_post_id,
      quote_content: payload.quote_content,
    })
    .select(POST_SELECT)
    .single();

  if (error) throw error;
  const post = normalise(data, userId);
  const [enriched] = await enrichWithRepostStatus([post], userId);
  return enriched;
}

export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) throw error;
}

export function subscribeToReplies(
  postId: string,
  userId: string | undefined,
  onNewReply: (reply: PostWithMeta) => void,
): () => void {
  const channel = supabase
    .channel(`replies:${postId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "posts",
        filter: `parent_post_id=eq.${postId}`,
      },
      async (payload) => {
        const newReplyId = (payload.new as Post).id;
        const enriched = await fetchPost(newReplyId, userId);
        if (enriched) onNewReply(enriched);
      },
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export function subscribeToPostStats(
  postId: string,
  onUpdate: (post: Partial<Post>) => void,
): () => void {
  const channel = supabase
    .channel(`post-stats:${postId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "posts",
        filter: `id=eq.${postId}`,
      },
      (payload) => onUpdate(payload.new as Partial<Post>),
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
