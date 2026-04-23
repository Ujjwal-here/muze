import React, { useMemo } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useTheme } from "@/context/theme";
import type { ThemeColors } from "@/constants/theme";
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
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const hasImage = reply.message_type === "image" && !!reply.metadata?.url;
  const handle = reply.sender_username ? `@${reply.sender_username}` : "You";
  const preview = replyPreviewText(reply.message_type, reply.content);

  return (
    <View style={[styles.quote, isMe ? styles.sent : styles.received]}>
      <View style={styles.bar} />
      <View style={styles.body}>
        <Text style={styles.handle} numberOfLines={1} ellipsizeMode="tail">
          {handle}
        </Text>
        <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
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

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    quote: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingVertical: Layout.vertical.sm,
      paddingHorizontal: Layout.horizontal.xs,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      gap: Layout.horizontal.xs,
    },
    sent: {
      backgroundColor: colors.replyQuoteSent,
    },
    received: {
      backgroundColor: colors.surfaceReplyReceived,
    },
    bar: {
      width: 3,
      alignSelf: "stretch",
      backgroundColor: colors.primary,
      borderRadius: 2,
    },
    body: {
      flex: 1,
      minWidth: 0,
    },
    handle: {
      fontFamily: Typography.fonts.dm.semibold,
      fontSize: Typography.sizes.xxs,
      color: colors.primary,
    },
    text: {
      fontFamily: Typography.fonts.dm.regular,
      fontSize: Typography.sizes.xxs,
      color: colors.text,
      marginTop: 1,
    },
    thumb: {
      width: iw(36),
      height: iw(36),
      borderRadius: 6,
      flexShrink: 0,
      marginTop: 2,
      backgroundColor: colors.surfaceSubtle,
    },
  });
