import React from "react";
import { Text, StyleSheet, StyleProp, TextStyle } from "react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";

interface CharCountProps {
  count: number;
  max: number;
  style?: StyleProp<TextStyle>;
}

export function CharCount({ count, max, style }: CharCountProps) {
  const over = count > max;
  return (
    <Text style={[styles.base, style]}>
      <Text style={over ? styles.countOver : styles.countOk}>{count}</Text>
      <Text style={styles.muted}>{` / ${max} Char`}</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: Typography.fonts.dm.medium,
    fontSize: Typography.sizes.xs,
    textAlign: "center",
  },
  countOk: {
    color: Colors.success,
    fontFamily: Typography.fonts.dm.semibold,
  },
  countOver: {
    color: Colors.danger,
    fontFamily: Typography.fonts.dm.semibold,
  },
  muted: {
    color: Colors.muted,
  },
});
