import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Layout } from "@/constants/layout";
import { Typography } from "@/constants/typography";
import { Colors } from "@/constants/colors";
import { formatDate } from "@/shared/utils/date";
import { PostAvatar } from "./PostAvatar";
import type { PostWithMeta } from "@/shared/types/post";

type Props = {
  post: PostWithMeta;
  replyLabel?: string;
};

export function PostHeader({ post, replyLabel }: Props) {
  const displayName =
    post.author?.full_name || post.author?.username || "Unknown";
  const username = post.author?.username || "unknown";
  const avatarName = post.author?.full_name || post.author?.username || "?";

  return (
    <View style={styles.header}>
      <PostAvatar avatarUrl={post.author?.avatar_url} name={avatarName} />
      <View style={styles.meta}>
        <View style={styles.nameRow}>
          <Text style={styles.username} numberOfLines={1}>
            @{username}
          </Text>
          {replyLabel ? (
            <Text
              style={styles.replyLabel}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {replyLabel}
            </Text>
          ) : (
            <>
              <Text style={styles.dot}>&middot;</Text>
              <Text style={styles.displayName} numberOfLines={1}>
                {displayName}
              </Text>
            </>
          )}
        </View>
        <Text style={styles.date}>{formatDate(post.created_at)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Layout.vertical.sm,
  },
  meta: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Layout.horizontal.xs,
  },
  nameRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: Layout.horizontal.xxs,
    minWidth: 0,
  },
  username: {
    fontFamily: Typography.fonts.dm.semibold,
    fontSize: Typography.sizes.xs,
    color: Colors.black,
    flexShrink: 0,
  },
  dot: {
    fontFamily: Typography.fonts.dm.bold,
    fontSize: Typography.sizes.xs,
    color: Colors.black,
  },
  displayName: {
    fontFamily: Typography.fonts.dm.medium,
    fontSize: Typography.sizes.xs,
    color: Colors.subtitle,
    flexShrink: 1,
  },
  replyLabel: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
    flex: 1,
    flexShrink: 1,
    lineHeight: Typography.sizes.xs * 1.35,
  },
  date: {
    fontFamily: Typography.fonts.dm.medium,
    fontSize: Typography.sizes.xxs,
    color: Colors.muted,
    flexShrink: 0,
    marginTop: 2,
  },
});
