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
};

export function PostHeader({ post }: Props) {
  const displayName =
    post.author?.full_name || post.author?.username || "Unknown";
  const username = post.author?.username || "unknown";
  const avatarName = post.author?.full_name || post.author?.username || "?";

  return (
    <View style={styles.header}>
      <PostAvatar avatarUrl={post.author?.avatar_url} name={avatarName} />
      <View style={styles.meta}>
        <View style={styles.nameRow}>
          <Text style={styles.username}>@{username}</Text>
          <Text style={styles.dot}>&middot;</Text>
          <Text style={styles.displayName}>{displayName}</Text>
        </View>
        <Text style={styles.date}>{formatDate(post.created_at)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Layout.vertical.sm,
  },
  meta: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Layout.horizontal.xxs,
  },
  username: {
    fontFamily: Typography.fonts.dm.semibold,
    fontSize: Typography.sizes.xs,
    color: Colors.black,
  },
  dot: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
  },
  displayName: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xs,
    color: Colors.subtitle,
  },
  date: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xxs,
    color: Colors.muted,
  },
});
