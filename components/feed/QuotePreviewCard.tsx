import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { Layout } from "@/constants/layout";
import { PostAvatar } from "@/components/feed/PostAvatar";
import {
  MediaRenderer,
  parseMediaUrls,
} from "@/components/common/MediaRenderer";
import { formatDate } from "@/shared/utils/date";
import type { PostWithMeta } from "@/shared/types/post";

type Props = {
  post: PostWithMeta;
};

export function QuotePreviewCard({ post }: Props) {
  const author = post.author;
  const displayName = author?.full_name || author?.username || "Unknown";
  const username = author?.username || "unknown";
  const bodyText =
    post.post_type === "quote" ? post.quote_content : post.content;
  const hasMedia = parseMediaUrls(post.media_urls).length > 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <PostAvatar avatarUrl={author?.avatar_url} name={displayName} />
        <View style={styles.nameRow}>
          <Text style={styles.username} numberOfLines={1}>
            @{username}
          </Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.displayName} numberOfLines={1}>
            {displayName}
          </Text>
        </View>
        <Text style={styles.date}>{formatDate(post.created_at)}</Text>
      </View>

      {!!bodyText && (
        <Text style={styles.content} numberOfLines={4}>
          {bodyText}
        </Text>
      )}

      {hasMedia && (
        <View style={styles.mediaWrap}>
          <MediaRenderer urls={post.media_urls} height={200} borderRadius={8} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: Layout.horizontal.sm,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  nameRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Layout.horizontal.xxs,
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
    marginLeft: Layout.horizontal.xxs,
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
