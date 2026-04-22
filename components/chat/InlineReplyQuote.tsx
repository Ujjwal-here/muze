import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { iw } from "@/shared/utils/responsive";
import { replyPreviewText } from "@/shared/utils/chat";
import type { ReplySnapshot } from "@/shared/types/chat";
import { Layout } from "@/constants/layout";

type Props = {
  reply: ReplySnapshot;
  isMe: boolean;
};

export function InlineReplyQuote({ reply, isMe }: Props) {
  const hasImage = reply.message_type === "image" && !!reply.metadata?.url;
  const handle = reply.sender_username ? `@${reply.sender_username}` : "You";
  const preview = replyPreviewText(reply.message_type, reply.content);

  return (
    <View style={[styles.quote, isMe ? styles.sent : styles.received]}>
      <View style={styles.bar} />
      <View style={styles.body}>
        <Text style={styles.handle} numberOfLines={1}>
          {handle}
        </Text>
        <Text style={styles.text} numberOfLines={1}>
          {preview}
        </Text>
      </View>
      {hasImage && (
        <Image
          source={{ uri: reply.metadata!.url }}
          style={styles.thumb}
          resizeMode="cover"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  quote: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Layout.vertical.sm,
    paddingHorizontal: Layout.horizontal.xs,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    gap: Layout.horizontal.xs,
  },
  sent: {
    backgroundColor: Colors.primaryTintSoft,
  },
  received: {
    backgroundColor: Colors.surfaceReplyReceived,
  },
  bar: {
    width: 3,
    alignSelf: "stretch",
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  handle: {
    fontFamily: Typography.fonts.dm.semibold,
    fontSize: Typography.sizes.xxs,
    color: Colors.primary,
  },
  text: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xxs,
    color: Colors.label,
    marginTop: 1,
  },
  thumb: {
    width: iw(28),
    height: iw(28),
    borderRadius: 5,
    backgroundColor: Colors.white,
  },
});
