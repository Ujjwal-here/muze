import React, { useMemo } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator } from "react-native";
import { useTheme } from "@/context/theme";
import type { ThemeColors } from "@/constants/theme";
import { Typography } from "@/constants/typography";
import { InlineReplyQuote } from "./InlineReplyQuote";
import type { Message, ReplySnapshot } from "@/shared/types/chat";
import { Layout } from "@/constants/layout";
import { iw } from "@/shared/utils/responsive";

type Props = {
  item: Message;
  isMe: boolean;
  replyTo: ReplySnapshot | null;
  showDelivered: boolean;
};

export function MessageBubble({ item, isMe, replyTo, showDelivered }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isImage = item.message_type === "image" && !!item.metadata?.url;

  return (
    <View style={[styles.stack, isMe && styles.stackMine]}>
      {isImage ? (
        <View
          style={[
            styles.imageBubble,
            isMe
              ? item.content
                ? styles.imageBubbleSent
                : styles.imageBubbleSentNoCaption
              : styles.imageBubbleReceived,
          ]}
        >
          {replyTo && <InlineReplyQuote reply={replyTo} isMe={isMe} />}
          <View
            style={[styles.imageWrap, replyTo && styles.imageWrapWithReply]}
          >
            <Image
              source={{ uri: item.metadata.url }}
              style={styles.image}
              resizeMode="cover"
            />
            {item.metadata?.uploading && (
              <View style={styles.imageOverlay}>
                <ActivityIndicator color={colors.white} />
              </View>
            )}
          </View>
          {item.content ? (
            <Text
              style={[
                styles.caption,
                isMe ? styles.captionSent : styles.captionReceived,
              ]}
            >
              {item.content}
            </Text>
          ) : null}
        </View>
      ) : (
        <View style={[styles.stack, isMe && styles.stackMine]}>
          {replyTo && <InlineReplyQuote reply={replyTo} isMe={isMe} />}
          <View
            style={[
              styles.bubble,
              isMe ? styles.bubbleSent : styles.bubbleReceived,
              replyTo && styles.bubbleWithReply,
              replyTo && styles.bubbleWithReplyMinWidth,
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                isMe ? styles.bubbleTextSent : styles.bubbleTextReceived,
              ]}
            >
              {item.content}
            </Text>
          </View>
        </View>
      )}

      {showDelivered && <Text style={styles.delivered}>Delivered</Text>}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    stack: {
      alignItems: "flex-start",
    },
    stackMine: {
      alignItems: "flex-end",
    },
    bubble: {
      paddingHorizontal: Layout.horizontal.sm,
      paddingVertical: Layout.vertical.sm,
      borderRadius: 10,
    },
    bubbleSent: {
      backgroundColor: colors.primary,
    },
    bubbleReceived: {
      backgroundColor: colors.bubbleReceived,
    },
    bubbleText: {
      fontFamily: Typography.fonts.dm.regular,
      fontSize: Typography.sizes.xs,
      lineHeight: Typography.sizes.xs * 1.4,
    },
    bubbleTextSent: {
      color: colors.bubbleSentText,
    },
    bubbleTextReceived: {
      color: colors.bubbleReceivedText,
    },
    bubbleWithReply: {
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
    },
    bubbleWithReplyMinWidth: {
      minWidth: Layout.horizontal["10xl"] + Layout.horizontal.xl,
      maxWidth: Layout.horizontal["10xl"] + Layout.horizontal.xl,
    },
    imageBubble: {
      borderRadius: 15,
      padding: Layout.vertical.xs,
      width: Layout.horizontal["10xl"] + Layout.horizontal.lg,
      maxWidth: "100%",
      overflow: "hidden",
    },
    imageBubbleSent: {
      backgroundColor: colors.primary,
    },
    imageBubbleSentNoCaption: {
      backgroundColor: "transparent",
    },
    imageBubbleReceived: {
      backgroundColor: colors.bubbleReceived,
    },
    imageWrap: {
      borderRadius: 10,
      overflow: "hidden",
    },
    imageWrapWithReply: {
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
    },
    image: {
      width: "100%",
      aspectRatio: 1,
      backgroundColor: colors.white,
    },
    imageOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.overlayLight,
      alignItems: "center",
      justifyContent: "center",
    },
    caption: {
      fontFamily: Typography.fonts.dm.regular,
      fontSize: Typography.sizes.xs,
      lineHeight: Typography.sizes.xs * 1.4,
      paddingHorizontal: Layout.horizontal.xs,
      paddingTop: Layout.vertical.xs,
      paddingBottom: Layout.vertical.xs,
    },
    captionSent: {
      color: colors.bubbleSentText,
    },
    captionReceived: {
      color: colors.bubbleReceivedText,
    },
    delivered: {
      fontFamily: Typography.fonts.dm.regular,
      fontSize: Typography.sizes.xxs,
      color: colors.muted,
      alignSelf: "flex-end",
      marginTop: Layout.vertical.xxs,
    },
  });
