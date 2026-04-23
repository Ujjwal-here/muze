import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Layout } from "@/constants/layout";
import { Typography } from "@/constants/typography";
import { useTheme } from "@/context/theme";
import type { ThemeColors } from "@/constants/theme";
import type { FeedTab } from "./FeedTopBar";

type Props = { activeTab: FeedTab };

export function FeedEmptyState({ activeTab }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const message =
    activeTab === "Following"
      ? "Follow some people to see their posts here."
      : "No posts yet. Be the first to post!";

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: Layout.vertical["3xl"],
    paddingHorizontal: Layout.horizontal.lg,
  },
  text: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.sm,
    color: colors.muted,
    textAlign: "center",
  },
});
