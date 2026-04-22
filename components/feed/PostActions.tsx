import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";
import {
  CornerUpLeft,
  ThumbsUp,
  ThumbsDown,
  MessageSquareMore,
  Repeat,
  Eye,
  MoreVertical,
} from "lucide-react-native";
import { iw } from "@/shared/utils/responsive";
import { Layout } from "@/constants/layout";
import { Typography } from "@/constants/typography";
import { Colors } from "@/constants/colors";
import type { PostWithMeta } from "@/shared/types/post";

type Props = {
  post: PostWithMeta;
  liked: boolean;
  disliked: boolean;
  likesCount: number;
  reposted: boolean;
  repostsCount: number;
  onLike: () => void;
  onDislike: () => void;
  onMenuOpen: () => void;
  onRepostPress: () => void;
};

const ICON_SIZE = iw(15);
const MENU_ICON_SIZE = iw(16);
const STROKE = 1.75;

const stop = (e: GestureResponderEvent) => e.stopPropagation();

function PillIcon({
  Icon,
  count,
  onPress,
}: {
  Icon: React.ComponentType<any>;
  count: number;
  onPress?: (e: GestureResponderEvent) => void;
}) {
  return (
    <Pressable
      style={styles.item}
      onPress={(e) => {
        stop(e);
        onPress?.(e);
      }}
    >
      <View style={styles.iconBg}>
        <Icon size={ICON_SIZE} color={Colors.muted} strokeWidth={STROKE} />
      </View>
      {count > 0 && <Text style={styles.count}>{count}</Text>}
    </Pressable>
  );
}

export function PostActions({
  post,
  liked,
  disliked,
  likesCount,
  reposted,
  repostsCount,
  onLike,
  onDislike,
  onMenuOpen,
  onRepostPress,
}: Props) {
  const groupActive = liked || disliked;

  return (
    <View style={styles.actions}>
      <PillIcon Icon={CornerUpLeft} count={post.comments_count} />

      <View style={styles.item}>
        <View
          style={[
            styles.likeDislikeGroup,
            groupActive && styles.likeDislikeGroupActive,
          ]}
        >
          <Pressable
            style={styles.likeBtn}
            onPress={(e) => {
              stop(e);
              onLike();
            }}
          >
            <ThumbsUp
              size={ICON_SIZE}
              color={liked ? Colors.primary : Colors.muted}
              fill={liked ? Colors.primary : "transparent"}
              strokeWidth={STROKE}
            />
            {likesCount > 0 && (
              <Text style={[styles.count, liked && styles.countActive]}>
                {likesCount}
              </Text>
            )}
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            onPress={(e) => {
              stop(e);
              onDislike();
            }}
          >
            <ThumbsDown
              size={ICON_SIZE}
              color={disliked ? Colors.primary : Colors.muted}
              fill={disliked ? Colors.primary : "transparent"}
              strokeWidth={STROKE}
            />
          </Pressable>
        </View>
      </View>

      <PillIcon Icon={MessageSquareMore} count={post.comments_count} />

      <Pressable
        style={styles.item}
        onPress={(e) => {
          stop(e);
          onRepostPress();
        }}
      >
        <View
          style={[styles.iconWithCount, reposted && styles.iconWithCountActive]}
        >
          <Repeat
            size={ICON_SIZE}
            color={reposted ? Colors.primary : Colors.muted}
            strokeWidth={STROKE}
          />
          {repostsCount > 0 && (
            <Text style={[styles.inlineCount, reposted && styles.countActive]}>
              {repostsCount}
            </Text>
          )}
        </View>
      </Pressable>

      <View style={styles.spacer} />

      <View style={styles.item}>
        <Eye size={ICON_SIZE} color={Colors.muted} strokeWidth={STROKE} />
        {post.views_count > 0 && (
          <Text style={styles.count}>{post.views_count}</Text>
        )}
      </View>

      <Pressable
        style={styles.item}
        onPress={(e) => {
          stop(e);
          onMenuOpen();
        }}
        hitSlop={8}
      >
        <MoreVertical
          size={MENU_ICON_SIZE}
          color={Colors.muted}
          strokeWidth={STROKE}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: Layout.vertical.md,
    flexDirection: "row",
    alignItems: "center",
    gap: Layout.horizontal.xxs,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: Layout.horizontal.xxs,
  },
  iconBg: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 20,
    paddingVertical: Layout.vertical.xs,
    paddingHorizontal: Layout.horizontal.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWithCount: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 20,
    paddingVertical: Layout.vertical.xs,
    paddingHorizontal: Layout.horizontal.sm,
    gap: Layout.horizontal.xxs,
  },
  iconWithCountActive: {
    backgroundColor: Colors.primaryTintStrong,
  },
  inlineCount: {
    fontFamily: Typography.fonts.dm.medium,
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
  },
  likeDislikeGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 20,
    overflow: "hidden",
    paddingVertical: Layout.vertical.xs,
    paddingHorizontal: Layout.horizontal.sm,
    gap: Layout.horizontal.xs,
  },
  likeDislikeGroupActive: {
    backgroundColor: Colors.primaryTintStrong,
  },
  likeBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  divider: {
    width: 2,
    height: Layout.vertical.smMd,
    backgroundColor: Colors.muted,
  },
  count: {
    marginLeft: Layout.horizontal.xxs,
    fontFamily: Typography.fonts.dm.medium,
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
  },
  countActive: { color: Colors.primary },
  spacer: { flex: 1 },
});
