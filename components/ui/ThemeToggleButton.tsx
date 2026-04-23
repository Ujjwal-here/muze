import React, { useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Sun, Moon } from "lucide-react-native";
import { iw } from "@/shared/utils/responsive";
import { useTheme } from "@/context/theme";
import type { ThemeColors } from "@/constants/theme";

type Props = {
  size?: number;
};

export function ThemeToggleButton({ size = 36 }: Props) {
  const { theme, toggleTheme, colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, size), [colors, size]);

  const Icon = theme === "light" ? Sun : Moon;

  return (
    <Pressable
      onPress={toggleTheme}
      style={({ pressed }) => [styles.circle, pressed && styles.circlePressed]}
      accessibilityRole="button"
      accessibilityLabel={`Theme: ${theme}. Tap to switch.`}
      hitSlop={8}
    >
      <Icon size={iw(16)} color={colors.label} strokeWidth={2} />
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors, size: number) =>
  StyleSheet.create({
    circle: {
      width: iw(size),
      height: iw(size),
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    circlePressed: {
      backgroundColor: colors.surfacePressed,
    },
  });
