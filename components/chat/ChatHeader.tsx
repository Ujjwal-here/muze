import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useTheme } from "@/context/theme";
import type { ThemeColors } from "@/constants/theme";
import { Typography } from "@/constants/typography";
import { Layout } from "@/constants/layout";
import { iw } from "@/shared/utils/responsive";

type Props = {
  username: string;
  avatarInitial: string;
  onBack: () => void;
};

export function ChatHeader({ username, avatarInitial, onBack }: Props) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  return (
    <View style={styles.bar}>
      <Pressable onPress={onBack} hitSlop={12}>
        <ArrowLeft size={iw(18)} color={colors.label} strokeWidth={1.75} />
      </Pressable>

      <Text style={styles.label}>CHAT</Text>

      <Text style={styles.divider}>|</Text>

      <View style={styles.avatar}>
        <Text style={styles.avatarTxt}>{avatarInitial}</Text>
      </View>

      <Text style={styles.username}>@{username}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    bar: {
      flexDirection: "row",
      alignItems: "center",
      gap: Layout.horizontal.sm,
      paddingHorizontal: Layout.horizontal.md,
      paddingVertical: Layout.vertical.sm,
      marginHorizontal: Layout.horizontal.sm,
      backgroundColor: isDark ? colors.background : colors.surface,
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
    avatar: {
      width: iw(26),
      height: iw(26),
      borderRadius: 999,
      backgroundColor: colors.avatarChat,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarTxt: {
      fontFamily: Typography.fonts.dm.bold,
      fontSize: Typography.sizes.xxs,
      color: colors.textOnPrimary,
    },
    username: {
      fontFamily: Typography.fonts.dm.medium,
      fontSize: Typography.sizes.xs,
      color: colors.label,
    },
  });
