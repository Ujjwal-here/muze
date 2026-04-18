import type { Profile } from "./chat";

export type ReactionType = "like";

export type PostType = "original" | "repost" | "quote";

export interface Post {
  id: string;
  user_id: string;
  content: string | null;
  media_urls: string[] | null;
  post_type: PostType;
  original_post_id: string | null;
  quote_content: string | null;
  parent_post_id: string | null;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  quotes_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface PostReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

export interface PostWithMeta extends Post {
  author: Profile;
  is_liked: boolean;
  is_reposted: boolean;
  original_post?: PostWithMeta | null;
  replies?: PostWithMeta[];
}

export interface CreatePostPayload {
  content?: string;
  media_urls?: string[];
  parent_post_id?: string;
}

export interface RepostPayload {
  original_post_id: string;
}

export interface QuotePostPayload {
  original_post_id: string;
  quote_content: string;
  media_urls?: string[];
}

export interface FeedParams {
  feed_type?: "following" | "discover";
  limit?: number;
  before?: string;
}

export interface PostThread {
  parent_chain: PostWithMeta[];
  post: PostWithMeta;
  replies: PostWithMeta[];
}
