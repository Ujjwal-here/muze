import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Layout } from "@/constants/layout";
import { Typography } from "@/constants/typography";
import { Colors } from "@/constants/colors";
import { formatDate } from "@/shared/utils/date";
import { PostAvatar } from "./PostAvatar";
import { MentionText } from "@/components/common/MentionText";
import {
  MediaRenderer,
  parseMediaUrls,
} from "@/components/common/MediaRenderer";
import type { PostWithMeta } from "@/shared/types/post";

type Props = {
  original: PostWithMeta;
};

export function OriginalPostCard({ original }: Props) {
  const displayName =
    original.author?.full_name || original.author?.username || "Unknown";
  const username = original.author?.username || "unknown";
  const bodyText =
    original.post_type === "quote" ? original.quote_content : original.content;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <PostAvatar
          avatarUrl={original.author?.avatar_url}
          name={displayName}
        />
        <View style={styles.nameRow}>
          <Text style={styles.username} numberOfLines={1}>
            @{username}
          </Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.displayName} numberOfLines={1}>
            {displayName}
          </Text>
        </View>
        <Text style={styles.date}>{formatDate(original.created_at)}</Text>
      </View>

      {!!bodyText && (
        <MentionText
          text={bodyText}
          style={styles.content}
          numberOfLines={4}
          onMentionPress={(u) => router.push(`/profile/${u}` as any)}
          mentionStyle={{ fontFamily: Typography.fonts.dm.medium }}
        />
      )}

      {parseMediaUrls(original.media_urls).length > 0 && (
        <View style={styles.mediaWrap}>
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

const styles = StyleSheet.create({
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
