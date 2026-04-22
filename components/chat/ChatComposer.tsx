import React from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";
import { ImageIcon, Send, X } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { Layout } from "@/constants/layout";
import { iw } from "@/shared/utils/responsive";
import { replyPreviewText } from "@/shared/utils/chat";
import type { ReplySnapshot } from "@/shared/types/chat";

export type PendingImage = {
  uri: string;
  mimeType: string | undefined;
};

type Props = {
  inputText: string;
  onChangeText: (t: string) => void;
  pendingImage: PendingImage | null;
  replyingTo: ReplySnapshot | null;
  sending: boolean;
  bottomPadding: number;
  onSend: () => void;
  onPickImage: () => void;
  onPickGif: () => void;
  onCancelImage: () => void;
  onCancelReply: () => void;
};

export function ChatComposer({
  inputText,
  onChangeText,
  pendingImage,
  replyingTo,
  sending,
  bottomPadding,
  onSend,
  onPickImage,
  onPickGif,
  onCancelImage,
  onCancelReply,
}: Props) {
  const canSend = (!!inputText.trim() || !!pendingImage) && !sending;

  return (
    <View style={[styles.bar, { paddingBottom: bottomPadding }]}>
      <View style={styles.pill}>
        {pendingImage && (
          <View style={styles.imageBar}>
            <View style={styles.imageWrap}>
              <Image
                source={{ uri: pendingImage.uri }}
                style={styles.imageThumb}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.imageLabel} numberOfLines={1}>
              Photo attached
            </Text>
            <Pressable
              onPress={onCancelImage}
              hitSlop={10}
              style={styles.closeBtn}
            >
              <X size={iw(18)} color={Colors.muted} strokeWidth={1.75} />
            </Pressable>
          </View>
        )}

        {replyingTo && (
          <View style={styles.replyBar}>
            <View style={styles.replyRail} />
            <View style={styles.replyBody}>
              <Text style={styles.replyHandle} numberOfLines={1}>
                Replying to{" "}
                {replyingTo.sender_username
                  ? `@${replyingTo.sender_username}`
                  : "you"}
              </Text>
              <Text style={styles.replyText} numberOfLines={1}>
                {replyPreviewText(replyingTo.message_type, replyingTo.content)}
              </Text>
            </View>
            {replyingTo.message_type === "image" &&
              replyingTo.metadata?.url && (
                <Image
                  source={{ uri: replyingTo.metadata.url }}
                  style={styles.replyThumb}
                  resizeMode="cover"
                />
              )}
            <Pressable
              onPress={onCancelReply}
              hitSlop={10}
              style={styles.closeBtn}
            >
              <X size={iw(18)} color={Colors.muted} strokeWidth={1.75} />
            </Pressable>
          </View>
        )}

        <View style={styles.row}>
          <Pressable
            style={styles.icon}
            hitSlop={8}
            onPress={onPickImage}
            disabled={sending}
          >
            <ImageIcon size={iw(20)} color={Colors.muted} strokeWidth={1.75} />
          </Pressable>

          <Pressable style={styles.icon} hitSlop={8} onPress={onPickGif}>
            <Text style={styles.gifLabel}>GIF</Text>
          </Pressable>

          <TextInput
            style={styles.input}
            placeholder="Write your message here..."
            placeholderTextColor={Colors.placeholder}
            value={inputText}
            onChangeText={onChangeText}
            multiline
            maxLength={2000}
            returnKeyType="default"
            cursorColor={Colors.black}
            selectionColor={Colors.black}
          />

          <Pressable
            style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
            onPress={onSend}
            disabled={!canSend}
            hitSlop={8}
          >
            <View style={{ transform: [{ rotate: "45deg" }] }}>
              <Send
                size={iw(20)}
                color={canSend ? Colors.primary : Colors.placeholder}
                strokeWidth={1.75}
              />
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Layout.horizontal.md,
    paddingTop: Layout.vertical.sm,
    backgroundColor: Colors.white,
    gap: Layout.horizontal.xs,
  },
  pill: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 25,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Layout.horizontal.sm,
    paddingVertical: Layout.vertical.xxs,
    minHeight: Layout.vertical.lg,
    gap: Layout.horizontal.xs,
  },
  icon: {
    paddingVertical: Layout.vertical.xxs,
    paddingHorizontal: Layout.horizontal.xxs,
  },
  gifLabel: {
    fontFamily: Typography.fonts.dm.bold,
    fontSize: Typography.sizes.xxs,
    color: Colors.muted,
    letterSpacing: 0.3,
  },
  input: {
    flex: 1,
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xs,
    color: Colors.black,
    maxHeight: Layout.vertical["5xl"],
    paddingVertical: 0,
    paddingHorizontal: Layout.horizontal.xxs,
  },
  sendBtn: {
    paddingVertical: Layout.vertical.sm,
    paddingLeft: Layout.horizontal.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    opacity: 0.6,
  },
  closeBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  imageBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Layout.vertical.sm,
    paddingHorizontal: Layout.horizontal.sm,
    gap: Layout.horizontal.xs,
  },
  imageWrap: {
    width: iw(40),
    height: iw(40),
    borderRadius: 10,
    overflow: "hidden",
  },
  imageThumb: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.white,
  },
  imageLabel: {
    flex: 1,
    minWidth: 0,
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xxs,
    color: Colors.label,
  },
  replyBar: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: Colors.primaryTintSoft,
    paddingRight: Layout.horizontal.md,
    gap: Layout.horizontal.xs,
  },
  replyRail: {
    width: 4,
    marginLeft: Layout.horizontal.sm,
    marginVertical: Layout.vertical.sm,
    backgroundColor: Colors.primary,
    borderRadius: 10,
  },
  replyBody: {
    flex: 1,
    minWidth: 0,
    paddingVertical: Layout.vertical.sm,
  },
  replyHandle: {
    fontFamily: Typography.fonts.dm.bold,
    fontSize: Typography.sizes.xxs,
    color: Colors.primary,
  },
  replyText: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xxs,
    color: Colors.label,
    marginTop: Layout.vertical.xxs,
  },
  replyThumb: {
    width: iw(28),
    height: iw(28),
    borderRadius: 5,
    marginTop: Layout.vertical.sm,
    backgroundColor: Colors.white,
  },
});
