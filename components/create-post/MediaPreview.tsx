import React from "react";
import { View, Image, Pressable, StyleSheet } from "react-native";
import { X } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Layout } from "@/constants/layout";
import { iw, ih } from "@/shared/utils/responsive";

type Props = {
  uri: string;
  onRemove: () => void;
};

export function MediaPreview({ uri, onRemove }: Props) {
  return (
    <View style={styles.card}>
      <Pressable style={styles.close} onPress={onRemove} hitSlop={8}>
        <X size={iw(14)} color={Colors.black} strokeWidth={1.75} />
      </Pressable>
      <Image source={{ uri }} style={styles.thumb} resizeMode="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Colors.inputBg,
    position: "relative",
  },
  close: {
    position: "absolute",
    top: Layout.vertical.sm,
    right: Layout.horizontal.sm,
    zIndex: 10,
    width: iw(24),
    height: iw(24),
    borderRadius: 999,
    backgroundColor: Colors.scrimStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  thumb: {
    width: "100%",
    height: Layout.vertical["22xl"],
    backgroundColor: Colors.border,
  },
});
