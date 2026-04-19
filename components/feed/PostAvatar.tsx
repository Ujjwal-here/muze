import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { iw } from "@/shared/utils/responsive";
import { Typography } from "@/constants/typography";
import { Colors } from "@/constants/colors";

type Props = {
  avatarUrl?: string | null;
  name: string;
};

export function PostAvatar({ avatarUrl, name }: Props) {
  const initial = (name || "?").charAt(0).toUpperCase();

  if (avatarUrl) {
    return <Image source={{ uri: avatarUrl }} style={styles.img} />;
  }

  return (
    <View style={styles.placeholder}>
      <Text style={styles.initial}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  img: {
    width: iw(22),
    height: iw(22),
    borderRadius: 999,
    marginRight: 8,
  },
  placeholder: {
    width: iw(22),
    height: iw(22),
    borderRadius: 999,
    backgroundColor: Colors.label,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  initial: {
    fontFamily: Typography.fonts.dm.bold,
    fontSize: Typography.sizes.xs,
    color: Colors.white,
  },
});
