import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Layout } from "@/constants/layout";
import { Typography } from "@/constants/typography";
import { Colors } from "@/constants/colors";

const TABS = ["Following", "All Muze"] as const;
export type FeedTab = (typeof TABS)[number];

type Props = {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
};

export function FeedTopBar({ activeTab, onTabChange }: Props) {
  return (
    <View style={styles.bar}>
      <Text style={styles.label}>HOME</Text>
      <Text style={styles.divider}>|</Text>
      {TABS.map((tab) => (
        <Pressable key={tab} onPress={() => onTabChange(tab)}>
          <Text style={[styles.tab, activeTab === tab && styles.tabActive]}>
            {tab}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: Layout.horizontal.md,
    paddingHorizontal: Layout.horizontal.lg,
    paddingVertical: Layout.vertical.sm,
    marginHorizontal: Layout.horizontal.sm,
    backgroundColor: Colors.white,
    borderRadius: 10,
  },
  label: {
    fontFamily: Typography.fonts.dm.bold,
    fontSize: Typography.sizes.sm,
    color: Colors.muted,
  },
  divider: {
    fontFamily: Typography.fonts.dm.semibold,
    fontSize: Typography.sizes.lg,
    color: Colors.muted,
  },
  tab: {
    fontFamily: Typography.fonts.dm.medium,
    fontSize: Typography.sizes.sm,
    color: Colors.muted,
  },
  tabActive: {
    color: Colors.black,
    fontFamily: Typography.fonts.dm.semibold,
  },
});
