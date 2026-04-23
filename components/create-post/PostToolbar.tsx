import React, { useMemo } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { ImageIcon, PlayCircle } from "lucide-react-native";
import { useTheme } from "@/context/theme";
import type { ThemeColors } from "@/constants/theme";
import { Layout } from "@/constants/layout";
import { iw } from "@/shared/utils/responsive";

type Props = {
  onPickImage: () => void;
  imagePicked: boolean;
  disabled?: boolean;
};

export function PostToolbar({ onPickImage, imagePicked, disabled }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.btn, imagePicked && styles.btnDisabled]}
        onPress={onPickImage}
        disabled={imagePicked || disabled}
      >
        <ImageIcon
          size={iw(18)}
          color={imagePicked ? colors.placeholder : colors.muted}
          strokeWidth={1.75}
        />
      </Pressable>
      <Pressable style={[styles.btn, styles.btnDisabled]} disabled>
        <PlayCircle
          size={iw(18)}
          color={colors.placeholder}
          strokeWidth={1.75}
        />
      </Pressable>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Layout.horizontal.sm,
  },
  btn: {
    width: iw(36),
    height: iw(36),
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSubtle,
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
