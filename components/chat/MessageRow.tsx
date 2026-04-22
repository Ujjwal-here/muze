import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { Layout } from "@/constants/layout";
import { iw } from "@/shared/utils/responsive";
import { SwipeableMessageRow } from "./SwipeableMessageRow";
import { MessageBubble } from "./MessageBubble";
import { formatDateSeparator } from "@/shared/utils/chat";
import type { Message, ReplySnapshot } from "@/shared/types/chat";

type Props = {
  item: Message;
  isMe: boolean;
  showDate: boolean;
  showAvatar: boolean;
  isGrouped: boolean;
  avatarInitial: string;
  showDelivered: boolean;
  canReply: boolean;
  onReply: () => void;
};

export function MessageRow({
  item,
  isMe,
  showDate,
  showAvatar,
  isGrouped,
  avatarInitial,
  showDelivered,
  canReply,
  onReply,
}: Props) {
  const replyTo: ReplySnapshot | null =
    (item.metadata?.reply_to as ReplySnapshot | undefined) ?? null;

  return (
    <View>
      {showDate && (
        <View style={styles.dateSeparator}>
          <View style={styles.dateLine} />
          <Text style={styles.dateText}>
            {formatDateSeparator(item.created_at)}
          </Text>
          <View style={styles.dateLine} />
        </View>
      )}

      <View
        style={[
          styles.msgRow,
          isMe ? styles.msgRowRight : styles.msgRowLeft,
          isGrouped && styles.msgRowGrouped,
        ]}
      >
        {!isMe && (
          <View style={styles.msgAvatar}>
            {showAvatar ? (
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{avatarInitial}</Text>
              </View>
            ) : (
              <View style={styles.avatarSpacer} />
            )}
          </View>
        )}

        <SwipeableMessageRow
          isMe={isMe}
          canSwipe={canReply}
          onSwipeReply={onReply}
        >
          <MessageBubble
            item={item}
            isMe={isMe}
            replyTo={replyTo}
            showDelivered={showDelivered}
          />
        </SwipeableMessageRow>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dateSeparator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Layout.vertical.md,
    gap: Layout.horizontal.sm,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dateText: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xxs,
    color: Colors.muted,
  },
  msgRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Layout.vertical.xxs,
    width: "100%",
  },
  msgRowGrouped: {
    marginBottom: Layout.vertical.xxs,
  },
  msgRowRight: {
    justifyContent: "flex-end",
  },
  msgRowLeft: {
    justifyContent: "flex-start",
  },
  msgAvatar: {
    width: iw(30),
    marginRight: Layout.horizontal.xxs,
    alignSelf: "flex-start",
  },
  avatarCircle: {
    width: iw(26),
    height: iw(26),
    borderRadius: 999,
    backgroundColor: Colors.avatarChat,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: Typography.fonts.dm.bold,
    fontSize: Typography.sizes.xxxs,
    color: Colors.white,
  },
  avatarSpacer: {
    width: iw(26),
    height: iw(26),
  },
});
