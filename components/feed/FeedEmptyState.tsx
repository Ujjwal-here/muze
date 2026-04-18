import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Layout } from "@/constants/layout";
import { Typography } from "@/constants/typography";
import { Colors } from "@/constants/colors";
import type { FeedTab } from "./FeedTopBar";

type Props = { activeTab: FeedTab };

export function FeedEmptyState({ activeTab }: Props) {
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

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: Layout.vertical["3xl"],
    paddingHorizontal: Layout.horizontal.lg,
  },
  text: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.muted,
    textAlign: "center",
  },
});
