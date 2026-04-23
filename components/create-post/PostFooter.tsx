import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/theme";
import type { ThemeColors } from "@/constants/theme";
import { Typography } from "@/constants/typography";
import { Layout } from "@/constants/layout";
import { iw } from "@/shared/utils/responsive";
import { PrimaryButton } from "@/components/ui";

interface PostFooterProps {
  charCount: number;
  maxChars: number;
  isOverLimit: boolean;
  canPost: boolean;
  posting: boolean;
  onPickImage: () => void;
  onPost: () => void;
}

export function PostFooter({
  charCount,
  maxChars,
  isOverLimit,
  canPost,
  posting,
  onPickImage,
  onPost,
}: PostFooterProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.footer}>
      <Text style={[styles.charCount, isOverLimit && styles.charCountOver]}>
        {charCount} / {maxChars} Char
      </Text>

      <View style={styles.toolbarRow}>
        <Pressable style={styles.toolBtn} onPress={onPickImage}>
          <Ionicons name="image-outline" size={iw(20)} color={colors.muted} />
        </Pressable>
      </View>

      <PrimaryButton
        label="Post"
        onPress={onPost}
        disabled={!canPost}
        loading={posting}
        loadingLabel="Posting..."
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  footer: {
    paddingHorizontal: Layout.horizontal.lg,
    paddingTop: Layout.vertical.sm,
    paddingBottom: Layout.vertical.lg,
    gap: Layout.vertical.md,
  },
  charCount: {
    fontFamily: Typography.fonts.dm.medium,
    fontSize: Typography.sizes.xs,
    color: colors.muted,
    textAlign: "center",
  },
  charCountOver: {
    color: colors.danger,
  },
  toolbarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Layout.horizontal.lg,
  },
  toolBtn: {
    width: iw(44),
    height: iw(44),
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMuted,
  },
});
