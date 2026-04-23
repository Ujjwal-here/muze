import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/context/theme";
import type { ThemeColors } from "@/constants/theme";
import { Typography } from "@/constants/typography";
import { Layout } from "@/constants/layout";
import { iw } from "@/shared/utils/responsive";
import { formatChatTime } from "@/shared/utils/date";
import { MessagePreview } from "./MessagePreview";
import type { InboxItem } from "@/shared/types/chat";

type Props = {
  convo: InboxItem;
  onPress: () => void;
};

export function ConversationRow({ convo, onPress }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const unreadCount = convo.unread_count ?? 0;
  const displayName = convo.other_username
    ? `@${convo.other_username}`
    : convo.other_full_name;
  const initial = (convo.other_full_name || convo.other_username)
    .charAt(0)
    .toUpperCase();

  return (
    <Pressable style={styles.item} onPress={onPress}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTxt}>{initial}</Text>
        </View>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeTxt}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.top}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={[styles.time, unreadCount > 0 && styles.timeUnread]}>
            {formatChatTime(convo.last_message_at)}
          </Text>
        </View>
        <MessagePreview convo={convo} unread={unreadCount > 0} />
      </View>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Layout.horizontal.lg,
    paddingVertical: Layout.vertical.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: Layout.horizontal.sm,
  },
  avatarWrap: {
    width: iw(44),
    height: iw(44),
  },
  avatar: {
    width: iw(40),
    height: iw(40),
    borderRadius: 999,
    backgroundColor: colors.label,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: {
    fontFamily: Typography.fonts.dm.bold,
    fontSize: Typography.sizes.xs,
    color: colors.white,
  },
  badge: {
    position: "absolute",
    top: -Layout.vertical.xxs,
    right: -Layout.horizontal.xxs,
    width: iw(18),
    height: iw(18),
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Layout.horizontal.xxs,
    borderWidth: 2,
    borderColor: colors.white,
  },
  badgeTxt: {
    fontFamily: Typography.fonts.dm.bold,
    fontSize: Typography.sizes.xxxs,
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Layout.vertical.xxs,
  },
  name: {
    fontFamily: Typography.fonts.dm.semibold,
    fontSize: Typography.sizes.xs,
    color: colors.black,
    flex: 1,
    marginRight: Layout.horizontal.xs,
  },
  time: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xxs,
    color: colors.muted,
  },
  timeUnread: {
    color: colors.primary,
    fontFamily: Typography.fonts.dm.semibold,
  },
});
