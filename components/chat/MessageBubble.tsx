import React from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator } from "react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { InlineReplyQuote } from "./InlineReplyQuote";
import type { Message, ReplySnapshot } from "@/shared/types/chat";
import { Layout } from "@/constants/layout";

type Props = {
  item: Message;
  isMe: boolean;
  replyTo: ReplySnapshot | null;
  showDelivered: boolean;
};

export function MessageBubble({ item, isMe, replyTo, showDelivered }: Props) {
  const isImage = item.message_type === "image" && !!item.metadata?.url;

  return (
    <View style={[styles.stack, isMe && styles.stackMine]}>
      {replyTo && <InlineReplyQuote reply={replyTo} isMe={isMe} />}

      {isImage ? (
        <View
          style={[
            styles.imageBubble,
            isMe
              ? item.content
                ? styles.imageBubbleSent
                : styles.imageBubbleSentNoCaption
              : styles.imageBubbleReceived,
            replyTo && styles.bubbleWithReply,
          ]}
        >
          <View style={styles.imageWrap}>
            <Image
              source={{ uri: item.metadata.url }}
              style={styles.image}
              resizeMode="cover"
            />
            {item.metadata?.uploading && (
              <View style={styles.imageOverlay}>
                <ActivityIndicator color={Colors.white} />
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
        <View
          style={[
            styles.bubble,
            isMe ? styles.bubbleSent : styles.bubbleReceived,
            replyTo && styles.bubbleWithReply,
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
      )}

      {showDelivered && <Text style={styles.delivered}>Delivered</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: Colors.primary,
  },
  bubbleReceived: {
    backgroundColor: Colors.surfaceSubtle,
  },
  bubbleText: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xs,
    lineHeight: Typography.sizes.xs * 1.4,
  },
  bubbleTextSent: {
    color: Colors.white,
  },
  bubbleTextReceived: {
    color: Colors.black,
  },
  bubbleWithReply: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  imageBubble: {
    alignSelf: "flex-start",
    borderRadius: 15,
    overflow: "hidden",
    padding: Layout.vertical.xs,
    width: Layout.horizontal["10xl"] + Layout.horizontal["6xl"],
    maxWidth: "100%",
  },
  imageBubbleSent: {
    backgroundColor: Colors.primary,
  },
  imageBubbleSentNoCaption: {
    backgroundColor: "transparent",
  },
  imageBubbleReceived: {
    backgroundColor: Colors.surfaceSubtle,
  },
  imageWrap: {
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: Colors.white,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlayLight,
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
    color: Colors.white,
  },
  captionReceived: {
    color: Colors.black,
  },
  delivered: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xxs,
    color: Colors.muted,
    alignSelf: "flex-end",
    marginTop: Layout.vertical.xxs,
  },
});
