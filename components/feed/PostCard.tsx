import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
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
import { PostHeader } from "./PostHeader";
import { PostActions } from "./PostActions";
import { PostAvatar } from "./PostAvatar";
import { formatDate } from "@/shared/utils/date";
import { router } from "expo-router";

const COLLAPSED_LINES = 4;

type Props = {
  post: PostWithMeta;
  currentUserId?: string;
  onLikeChange: (postId: string, liked: boolean, count: number) => void;
  onDeleted: (postId: string) => void;
};

function OriginalPostCard({ original }: { original: PostWithMeta }) {
  const displayName =
    original.author?.full_name || original.author?.username || "Unknown";
  const username = original.author?.username || "unknown";

  const bodyText =
    original.post_type === "quote" ? original.quote_content : original.content;

  return (
    <View style={inlineStyles.card}>
      <View style={inlineStyles.header}>
        <PostAvatar
          avatarUrl={original.author?.avatar_url}
          name={displayName}
        />
        <View style={inlineStyles.nameRow}>
          <Text style={inlineStyles.username} numberOfLines={1}>
            @{username}
          </Text>
          <Text style={inlineStyles.dot}>·</Text>
          <Text style={inlineStyles.displayName} numberOfLines={1}>
            {displayName}
          </Text>
        </View>
        <Text style={inlineStyles.date}>{formatDate(original.created_at)}</Text>
      </View>

      {!!bodyText && (
        <Text style={inlineStyles.content} numberOfLines={4}>
          {bodyText}
        </Text>
      )}

      {parseMediaUrls(original.media_urls).length > 0 && (
        <View style={inlineStyles.mediaWrap}>
          <MediaRenderer
            urls={original.media_urls}
            height={200}
            borderRadius={8}
          />
        </View>
      )}
    </View>
  );
}

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
  const [repostsCount, setRepostsCount] = useState(post.reposts_count);
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [truncatedText, setTruncatedText] = useState("");

  useEffect(() => {
    setLiked(post.is_liked);
    setLikesCount(post.likes_count);
    setReposted(post.is_reposted);
    setRepostsCount(post.reposts_count);
  }, [post.is_liked, post.likes_count, post.is_reposted, post.reposts_count]);

  const handleLike = async () => {
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
  };

  const handleDislike = () => {
    if (liked) {
      setLiked(false);
      setLikesCount((c) => Math.max(0, c - 1));
    }
    setDisliked((d) => !d);
  };

  const handleRepostChange = (newReposted: boolean) => {
    setReposted(newReposted);
    setRepostsCount((c) => (newReposted ? c + 1 : Math.max(0, c - 1)));
  };

  const handleQuote = () => {
    router.push({ pathname: "/quote_post", params: { postId: post.id } });
  };

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
          <View>
            <Text
              style={[styles.content, styles.hiddenText]}
              onTextLayout={(e) => {
                const lines = e.nativeEvent.lines;
                if (lines.length > COLLAPSED_LINES) {
                  setIsTruncated(true);
                  setTruncatedText(
                    lines
                      .slice(0, COLLAPSED_LINES)
                      .map((l) => l.text)
                      .join("")
                      .trimEnd(),
                  );
                }
              }}
            >
              {bodyText}
            </Text>
            {!expanded && isTruncated ? (
              <Text style={styles.content}>
                {truncatedText}
                <Text
                  style={styles.more}
                  onPress={(e) => {
                    e.stopPropagation();
                    setExpanded(true);
                  }}
                >
                  {" "}
                  ...more
                </Text>
              </Text>
            ) : (
              <Text style={styles.content}>{bodyText}</Text>
            )}
            {isTruncated && expanded && (
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  setExpanded(false);
                }}
              >
                <Text style={styles.toggle}>Show less</Text>
              </Pressable>
            )}
          </View>
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
  hiddenText: {
    position: "absolute",
    opacity: 0,
  },
  more: {
    fontFamily: Typography.fonts.dm.medium,
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
  },
  toggle: {
    fontFamily: Typography.fonts.dm.medium,
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
    marginBottom: Layout.vertical.xs,
  },
  mediaWrap: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Colors.white,
  },
});

const inlineStyles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: Layout.horizontal.sm,
    marginBottom: Layout.vertical.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  nameRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 0,
  },
  username: {
    fontFamily: Typography.fonts.dm.semibold,
    fontSize: Typography.sizes.xs,
    color: Colors.black,
    flexShrink: 1,
  },
  dot: {
    color: Colors.muted,
    fontSize: Typography.sizes.xs,
  },
  displayName: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
    flexShrink: 1,
  },
  date: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xxs,
    color: Colors.muted,
    marginLeft: 8,
  },
  content: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xs,
    color: Colors.black,
    lineHeight: Typography.sizes.xs * 1.5,
    marginTop: Layout.vertical.xs,
  },
  mediaWrap: {
    marginTop: Layout.vertical.sm,
    borderRadius: 8,
    overflow: "hidden",
  },
});
