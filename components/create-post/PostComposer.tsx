import React, { RefObject } from "react";
import { View, TextInput, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { Layout } from "@/constants/layout";
import { iw } from "@/shared/utils/responsive";

type MediaItem = {
  uri: string;
  type: "image";
  fileName?: string;
  mimeType?: string;
};

interface PostComposerProps {
  inputRef: RefObject<TextInput>;
  content: string;
  onChangeText: (text: string) => void;
  media: MediaItem | null;
  onRemoveMedia: () => void;
}

export function PostComposer({
  inputRef,
  content,
  onChangeText,
  media,
  onRemoveMedia,
}: PostComposerProps) {
  return (
    <View style={styles.composerWrap}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder="Share something that inspires your followers, drop a laugh-out-loud meme, or ignite a bold debate in your community..."
        placeholderTextColor={Colors.placeholder}
        multiline
        autoFocus
        value={content}
        onChangeText={onChangeText}
        textAlignVertical="top"
      />
      {media && (
        <View style={styles.mediaCard}>
          <Pressable style={styles.mediaClose} onPress={onRemoveMedia}>
            <Ionicons name="close" size={iw(14)} color={Colors.black} />
          </Pressable>
          <Image
            source={{ uri: media.uri }}
            style={styles.mediaThumb}
            resizeMode="cover"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  composerWrap: {
    flex: 1,
    paddingHorizontal: Layout.horizontal.lg,
    paddingTop: Layout.vertical.lg,
    paddingBottom: Layout.vertical["3xl"],
  },
  input: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.black,
    lineHeight: Typography.sizes.sm * 1.6,
    minHeight: Layout.vertical["10xl"],
    padding: 0,
  },
  mediaCard: {
    marginTop: Layout.vertical.md,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Colors.inputBg,
    position: "relative",
  },
  mediaClose: {
    position: "absolute",
    top: Layout.vertical.sm,
    right: Layout.horizontal.sm,
    zIndex: 10,
    width: iw(24),
    height: iw(24),
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  mediaThumb: {
    width: "100%",
    height: Layout.vertical["22xl"],
    backgroundColor: Colors.border,
  },
});
