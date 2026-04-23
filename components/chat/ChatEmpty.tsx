import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/context/theme";
import type { ThemeColors } from "@/constants/theme";
import { Typography } from "@/constants/typography";
import { Layout } from "@/constants/layout";
import { iw } from "@/shared/utils/responsive";

type Props = {
  avatarInitial: string;
  displayName: string;
  username: string;
};

export function ChatEmpty({ avatarInitial, displayName, username }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.wrap}>
      <View style={styles.avatar}>
        <Text style={styles.avatarTxt}>{avatarInitial}</Text>
      </View>
      <Text style={styles.name}>{displayName}</Text>
      <Text style={styles.sub}>@{username}</Text>
      <Text style={styles.hint}>Send a message to start the conversation</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Layout.vertical["5xl"],
    gap: Layout.vertical.xxs,
  },
  avatar: {
    width: iw(60),
    height: iw(60),
    borderRadius: 999,
    backgroundColor: colors.label,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Layout.vertical.sm,
  },
  avatarTxt: {
    fontFamily: Typography.fonts.dm.bold,
    fontSize: Typography.sizes.xl,
    color: colors.white,
  },
  name: {
    fontFamily: Typography.fonts.dm.semibold,
    fontSize: Typography.sizes.base,
    color: colors.black,
  },
  sub: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xs,
    color: colors.muted,
  },
  hint: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xs,
    color: colors.placeholder,
    marginTop: Layout.vertical.sm,
  },
});
