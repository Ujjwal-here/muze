import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { ImageIcon, PlayCircle } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Layout } from "@/constants/layout";
import { iw } from "@/shared/utils/responsive";

type Props = {
  onPickImage: () => void;
  imagePicked: boolean;
  disabled?: boolean;
};

export function PostToolbar({ onPickImage, imagePicked, disabled }: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.btn, imagePicked && styles.btnDisabled]}
        onPress={onPickImage}
        disabled={imagePicked || disabled}
      >
        <ImageIcon
          size={iw(18)}
          color={imagePicked ? Colors.placeholder : Colors.muted}
          strokeWidth={1.75}
        />
      </Pressable>
      <Pressable style={[styles.btn, styles.btnDisabled]} disabled>
        <PlayCircle
          size={iw(18)}
          color={Colors.placeholder}
          strokeWidth={1.75}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: Colors.surfaceSubtle,
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
