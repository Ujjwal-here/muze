import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Layout } from "@/constants/layout";
import { Typography } from "@/constants/typography";
import { Colors } from "@/constants/colors";
import { toggleLike } from "@/shared/services/posts";
import type { PostWithMeta } from "@/shared/types/post";
import { PostMenu } from "@/components/common/PostMenu";
import {
  MediaRenderer,
  parseMediaUrls,
} from "@/components/common/MediaRenderer";
import { PostHeader } from "./PostHeader";
import { PostActions } from "./PostActions";

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
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [liking, setLiking] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    setLiked(post.is_liked);
    setLikesCount(post.likes_count);
  }, [post.is_liked, post.likes_count]);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
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

  return (
    <>
      <Pressable
        style={styles.card}
        onPress={() => router.push(`/post/${post.id}`)}
      >
        <PostHeader post={post} />

        {!!post.content && (
          <Text style={styles.content} numberOfLines={6}>
            {post.content}
          </Text>
        )}

        {parseMediaUrls(post.media_urls).length > 0 && (
          <View style={styles.mediaWrap}>
            <MediaRenderer
              urls={post.media_urls}
              height={200}
              borderRadius={12}
            />
          </View>
        )}

        <PostActions
          post={post}
          liked={liked}
          likesCount={likesCount}
          onLike={handleLike}
          onMenuOpen={() => setMenuVisible(true)}
        />
      </Pressable>

      <PostMenu
        post={post}
        currentUserId={currentUserId}
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onDeleted={onDeleted}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Layout.horizontal.sm,
    paddingHorizontal: Layout.horizontal.lg,
    paddingVertical: Layout.vertical.lg,
    backgroundColor: Colors.white,
    marginTop: Layout.vertical.sm,
    borderRadius: 10,
  },
  content: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.black,
    lineHeight: Typography.sizes.sm * 1.6,
    marginBottom: Layout.vertical.md,
  },
  mediaWrap: {
    marginBottom: Layout.vertical.md,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Colors.white,
  },
});
