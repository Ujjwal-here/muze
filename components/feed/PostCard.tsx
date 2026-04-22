import React, { useCallback, useEffect, useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Layout } from "@/constants/layout";
import { Typography } from "@/constants/typography";
import { Colors } from "@/constants/colors";
import { toggleLike } from "@/shared/services/posts";
import type { PostWithMeta } from "@/shared/types/post";
import { PostMenu } from "@/components/common/PostMenu";
import { RepostSheet } from "@/components/common/RepostSheet";
import {
  MediaRenderer,
  parseMediaUrls,
} from "@/components/common/MediaRenderer";
import { ExpandableMentionText } from "@/components/common/ExpandableMentionText";
import { PostHeader } from "./PostHeader";
import { PostActions } from "./PostActions";
import { OriginalPostCard } from "./OriginalPostCard";

type Props = {
  post: PostWithMeta;
  currentUserId?: string;
  onLikeChange: (postId: string, liked: boolean, count: number) => void;
  onDeleted: (postId: string) => void;
};

export function PostCard({
  post,
  currentUserId,
  onLikeChange,
  onDeleted,
}: Props) {
  const [liked, setLiked] = useState(post.is_liked);
  const [disliked, setDisliked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [liking, setLiking] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [repostSheetVisible, setRepostSheetVisible] = useState(false);
  const [reposted, setReposted] = useState(post.is_reposted);
  // Combined reposts + quotes is what the UI shows on the repost button;
  // the server columns stay separate.
  const [repostsCount, setRepostsCount] = useState(
    post.reposts_count + post.quotes_count,
  );

  useEffect(() => {
    setLiked(post.is_liked);
    setLikesCount(post.likes_count);
    setReposted(post.is_reposted);
    setRepostsCount(post.reposts_count + post.quotes_count);
  }, [
    post.is_liked,
    post.likes_count,
    post.is_reposted,
    post.reposts_count,
    post.quotes_count,
  ]);

  const handleLike = useCallback(async () => {
    if (liking) return;
    setLiking(true);
    if (disliked) setDisliked(false);
    const newLiked = !liked;
    const newCount = newLiked ? likesCount + 1 : Math.max(0, likesCount - 1);
    setLiked(newLiked);
    setLikesCount(newCount);
    try {
      const result = await toggleLike(post.id);
      setLiked(result.liked);
      setLikesCount(result.likes_count);
      onLikeChange(post.id, result.liked, result.likes_count);
    } catch {
      setLiked(!newLiked);
      setLikesCount(likesCount);
    } finally {
      setLiking(false);
    }
  }, [liking, liked, disliked, likesCount, post.id, onLikeChange]);

  const handleDislike = useCallback(() => {
    if (liked) {
      setLiked(false);
      setLikesCount((c) => Math.max(0, c - 1));
    }
    setDisliked((d) => !d);
  }, [liked]);

  const handleRepostChange = useCallback((newReposted: boolean) => {
    setReposted(newReposted);
    setRepostsCount((c) => (newReposted ? c + 1 : Math.max(0, c - 1)));
  }, []);

  const handleQuote = useCallback(() => {
    router.push({ pathname: "/quote_post", params: { postId: post.id } });
  }, [post.id]);

  const isRepost = post.post_type === "repost";
  const isQuote = post.post_type === "quote";
  const displayPost =
    isRepost && post.original_post ? post.original_post : post;
  const bodyText = isQuote ? post.quote_content : displayPost.content;

  const replyLabel =
    isRepost || isQuote
      ? `replied to ${
          post.author?.id === post.original_post?.user_id
            ? "their post"
            : `@${post.original_post?.author?.username || "someone"}'s post`
        }`
      : undefined;

  return (
    <>
      <Pressable style={styles.card}>
        {isQuote && post.original_post && (
          <OriginalPostCard original={post.original_post} />
        )}

        <PostHeader
          post={isQuote ? post : displayPost}
          replyLabel={replyLabel}
        />

        {!!bodyText && (
          <ExpandableMentionText
            text={bodyText}
            style={styles.content}
            mentionStyle={styles.mention}
          />
        )}

        {parseMediaUrls(displayPost.media_urls).length > 0 && (
          <View style={styles.mediaWrap}>
            <MediaRenderer
              urls={displayPost.media_urls}
              height={200}
              borderRadius={12}
            />
          </View>
        )}

        <PostActions
          post={post}
          liked={liked}
          disliked={disliked}
          likesCount={likesCount}
          reposted={reposted}
          repostsCount={repostsCount}
          onLike={handleLike}
          onDislike={handleDislike}
          onMenuOpen={() => setMenuVisible(true)}
          onRepostPress={() => setRepostSheetVisible(true)}
        />
      </Pressable>

      <PostMenu
        post={post}
        currentUserId={currentUserId}
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onDeleted={onDeleted}
      />
      <RepostSheet
        post={post}
        visible={repostSheetVisible}
        isReposted={reposted}
        onClose={() => setRepostSheetVisible(false)}
        onRepostChange={handleRepostChange}
        onQuote={handleQuote}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Layout.horizontal.sm,
    paddingHorizontal: Layout.horizontal.sm,
    paddingVertical: Layout.vertical.md,
    backgroundColor: Colors.white,
    marginTop: Layout.vertical.sm,
    borderRadius: 8,
  },
  content: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xs,
    color: Colors.black,
    marginVertical: Layout.vertical.xs,
  },
  mention: {
    fontFamily: Typography.fonts.dm.medium,
  },
  mediaWrap: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Colors.white,
  },
});
