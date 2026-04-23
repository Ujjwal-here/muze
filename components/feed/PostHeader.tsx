import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Layout } from "@/constants/layout";
import { Typography } from "@/constants/typography";
import { useTheme } from "@/context/theme";
import type { ThemeColors } from "@/constants/theme";
import { formatDate } from "@/shared/utils/date";
import { PostAvatar } from "./PostAvatar";
import type { PostWithMeta } from "@/shared/types/post";

type Props = {
  post: PostWithMeta;
  replyLabel?: string;
};

export function PostHeader({ post, replyLabel }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const displayName =
    post.author?.full_name || post.author?.username || "Unknown";
  const username = post.author?.username || "unknown";
  const avatarName = post.author?.full_name || post.author?.username || "?";

  return (
    <View style={styles.header}>
      <PostAvatar avatarUrl={post.author?.avatar_url} name={avatarName} />
      <View style={styles.meta}>
        <View style={styles.nameRow}>
          {replyLabel ? (
            <Text
              style={styles.inlineReplyRow}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              <Text style={styles.username}>@{username}</Text>
              <Text style={styles.replyLabel}> {replyLabel}</Text>
            </Text>
          ) : (
            <>
              <Text style={styles.username} numberOfLines={1}>
                @{username}
              </Text>
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

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
    alignItems: "center",
    gap: Layout.horizontal.xxs,
    minWidth: 0,
  },
  inlineReplyRow: {
    flex: 1,
    minWidth: 0,
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xs,
    color: colors.muted,
  },
  username: {
    fontFamily: Typography.fonts.dm.semibold,
    fontSize: Typography.sizes.xs,
    color: colors.black,
    flexShrink: 0,
  },
  dot: {
    fontFamily: Typography.fonts.dm.bold,
    fontSize: Typography.sizes.xs,
    color: colors.black,
  },
  displayName: {
    fontFamily: Typography.fonts.dm.medium,
    fontSize: Typography.sizes.xs,
    color: colors.subtitle,
    flexShrink: 1,
  },
  replyLabel: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xs,
    color: colors.muted,
    flex: 1,
    flexShrink: 1,
    lineHeight: Typography.sizes.xs * 1.35,
  },
  date: {
    fontFamily: Typography.fonts.dm.medium,
    fontSize: Typography.sizes.xxs,
    color: colors.muted,
    flexShrink: 0,
  },
});
