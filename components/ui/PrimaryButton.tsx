import React, { useMemo } from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import { useTheme } from "@/context/theme";
import type { ThemeColors } from "@/constants/theme";
import { Typography } from "@/constants/typography";
import { Layout } from "@/constants/layout";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  loadingLabel = "Loading...",
  disabled = false,
  style,
}: PrimaryButtonProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isDisabled = disabled || loading;
  return (
    <Pressable
      style={({ pressed }) => [
        styles.btn,
        isDisabled && styles.btnDisabled,
        pressed && !isDisabled && { backgroundColor: colors.primaryPressed },
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      <Text style={styles.label}>{loading ? loadingLabel : label}</Text>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    btn: {
      paddingVertical: Layout.vertical.smMd,
      backgroundColor: colors.primary,
      borderRadius: 30,
      alignItems: "center",
      justifyContent: "center",
    },
    btnDisabled: {
      opacity: 0.5,
    },
    label: {
      fontFamily: Typography.fonts.dm.semibold,
      fontSize: Typography.sizes.sm,
      color: colors.textOnPrimary,
    },
  });
