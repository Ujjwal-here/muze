import React, { useMemo } from "react";
import { Text, StyleSheet, StyleProp, TextStyle } from "react-native";
import { useTheme } from "@/context/theme";
import type { ThemeColors } from "@/constants/theme";
import { Typography } from "@/constants/typography";

interface CharCountProps {
  count: number;
  max: number;
  style?: StyleProp<TextStyle>;
}

export function CharCount({ count, max, style }: CharCountProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const over = count > max;
  return (
    <Text style={[styles.base, style]}>
      <Text style={over ? styles.countOver : styles.countOk}>{count}</Text>
      <Text style={styles.muted}>{` / ${max} Char`}</Text>
    </Text>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  base: {
    fontFamily: Typography.fonts.dm.medium,
    fontSize: Typography.sizes.xs,
    textAlign: "center",
  },
  countOk: {
    color: colors.success,
    fontFamily: Typography.fonts.dm.semibold,
  },
  countOver: {
    color: colors.danger,
    fontFamily: Typography.fonts.dm.semibold,
  },
  muted: {
    color: colors.muted,
  },
});
