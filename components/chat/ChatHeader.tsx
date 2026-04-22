import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { Layout } from "@/constants/layout";
import { iw, ih } from "@/shared/utils/responsive";

type Props = {
  displayName: string;
  username: string;
  avatarInitial: string;
  topInset: number;
  onBack: () => void;
};

export function ChatHeader({
  displayName,
  username,
  avatarInitial,
  topInset,
  onBack,
}: Props) {
  return (
    <View style={[styles.header, { paddingTop: topInset + ih(10) }]}>
      <Pressable onPress={onBack} hitSlop={12}>
        <ArrowLeft size={iw(24)} color={Colors.black} strokeWidth={1.75} />
      </Pressable>

      <View style={styles.center}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTxt}>{avatarInitial}</Text>
        </View>
        <View>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.username}>@{username}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Layout.horizontal.md,
    paddingBottom: Layout.vertical.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  center: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: Layout.horizontal.sm,
    gap: Layout.horizontal.sm,
  },
  avatar: {
    width: iw(34),
    height: iw(34),
    borderRadius: 999,
    backgroundColor: Colors.label,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: {
    fontFamily: Typography.fonts.dm.bold,
    fontSize: Typography.sizes.xs,
    color: Colors.white,
  },
  name: {
    fontFamily: Typography.fonts.dm.semibold,
    fontSize: Typography.sizes.xs,
    color: Colors.black,
  },
  username: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xxs,
    color: Colors.muted,
  },
});
