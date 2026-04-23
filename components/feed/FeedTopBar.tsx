import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Layout } from "@/constants/layout";
import { Typography } from "@/constants/typography";
import { useTheme } from "@/context/theme";
import type { ThemeColors } from "@/constants/theme";
import { ThemeToggleButton } from "@/components/ui/ThemeToggleButton";

const TABS = ["Following", "All Muze"] as const;
export type FeedTab = (typeof TABS)[number];

type Props = {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
};

export function FeedTopBar({ activeTab, onTabChange }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.bar}>
      <Text style={styles.label}>HOME</Text>
      <Text style={styles.divider}>|</Text>
      <View style={styles.tabsGroup}>
        {TABS.map((tab) => {
          const active = activeTab === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => onTabChange(tab)}
              style={[styles.tabPill, active && styles.tabPillActive]}
            >
              <Text style={[styles.tab, active && styles.tabActive]}>
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.spacer} />
      <ThemeToggleButton size={28} />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    bar: {
      flexDirection: "row",
      alignItems: "center",
      gap: Layout.horizontal.sm,
      paddingHorizontal: Layout.horizontal.md,
      paddingVertical: Layout.vertical.sm,
      marginHorizontal: Layout.horizontal.sm,
      backgroundColor: colors.background,
      borderRadius: 10,
    },
    label: {
      fontFamily: Typography.fonts.dm.bold,
      fontSize: Typography.sizes.xs,
      color: colors.label,
      letterSpacing: 0.5,
    },
    divider: {
      fontFamily: Typography.fonts.dm.regular,
      fontSize: Typography.sizes.sm,
      color: colors.muted,
      opacity: 0.6,
    },
    tabsGroup: {
      flexDirection: "row",
      gap: Layout.horizontal.xs,
    },
    tabPill: {
      paddingHorizontal: Layout.horizontal.sm,
      paddingVertical: Layout.vertical.xxs,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: "transparent",
    },
    tabPillActive: {
      backgroundColor: colors.pillActiveBg,
      borderColor: colors.pillActiveBg,
    },
    tab: {
      fontFamily: Typography.fonts.dm.medium,
      fontSize: Typography.sizes.xs,
      color: colors.muted,
    },
    tabActive: {
      color: colors.pillActiveText,
      fontFamily: Typography.fonts.dm.semibold,
    },
    spacer: {
      flex: 1,
    },
  });
