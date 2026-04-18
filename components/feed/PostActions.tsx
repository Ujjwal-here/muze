import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { iw } from "@/shared/utils/responsive";
import { Layout } from "@/constants/layout";
import { Typography } from "@/constants/typography";
import { Colors } from "@/constants/colors";
import type { PostWithMeta } from "@/shared/types/post";

type Props = {
  post: PostWithMeta;
  liked: boolean;
  likesCount: number;
  onLike: () => void;
  onMenuOpen: () => void;
};

export function PostActions({
  post,
  liked,
  likesCount,
  onLike,
  onMenuOpen,
}: Props) {
  const stop = (e: any) => e.stopPropagation();

  return (
    <View style={styles.actions}>
      {/* Reply */}
      <Pressable
        style={styles.item}
        onPress={(e) => {
          stop(e);
          router.push(`/post/${post.id}`);
        }}
      >
        <Ionicons
          name="arrow-undo-outline"
          size={iw(16)}
          color={Colors.muted}
        />
      </Pressable>

      {/* Like */}
      <Pressable
        style={styles.item}
        onPress={(e) => {
          stop(e);
          onLike();
        }}
      >
        <Ionicons
          name={liked ? "thumbs-up" : "thumbs-up-outline"}
          size={iw(16)}
          color={liked ? Colors.primary : Colors.muted}
        />
        {likesCount > 0 && (
          <Text style={[styles.count, liked && styles.countActive]}>
            {likesCount}
          </Text>
        )}
      </Pressable>

      {/* Dislike */}
      <Pressable style={styles.item} onPress={stop}>
        <Ionicons
          name="thumbs-down-outline"
          size={iw(16)}
          color={Colors.muted}
        />
      </Pressable>

      {/* Comment */}
      <Pressable
        style={styles.item}
        onPress={(e) => {
          stop(e);
          router.push(`/post/${post.id}`);
        }}
      >
        <Ionicons
          name="chatbubble-outline"
          size={iw(14)}
          color={Colors.muted}
        />
        {post.comments_count > 0 && (
          <Text style={styles.count}>{post.comments_count}</Text>
        )}
      </Pressable>

      {/* Repost */}
      <Pressable style={styles.item} onPress={stop}>
        <Ionicons name="repeat-outline" size={iw(16)} color={Colors.muted} />
        {post.reposts_count > 0 && (
          <Text style={styles.count}>{post.reposts_count}</Text>
        )}
      </Pressable>

      <View style={styles.spacer} />

      {/* Views */}
      <View style={styles.item}>
        <Ionicons name="eye-outline" size={iw(14)} color={Colors.muted} />
        {post.views_count > 0 && (
          <Text style={styles.count}>{post.views_count}</Text>
        )}
      </View>

      {/* Menu */}
      <Pressable
        style={styles.item}
        onPress={(e) => {
          stop(e);
          onMenuOpen();
        }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons
          name="ellipsis-horizontal"
          size={iw(16)}
          color={Colors.muted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Layout.horizontal.md,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: Layout.horizontal.xxs,
  },
  count: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xxs,
    color: Colors.muted,
  },
  countActive: { color: Colors.primary },
  spacer: { flex: 1 },
});
