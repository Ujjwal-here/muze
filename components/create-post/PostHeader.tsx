import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { Layout } from "@/constants/layout";
import { iw } from "@/shared/utils/responsive";

interface PostHeaderProps {
  initial: string;
}

export function PostHeader({ initial }: PostHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={iw(20)} color={Colors.black} />
      </Pressable>

      <View style={styles.feedRow}>
        <View style={styles.feedPill}>
          <Text style={styles.postToText}>Post to </Text>

          <View style={styles.avatarPill}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTxt}>{initial}</Text>
            </View>
            <Text style={styles.feedLabel}> My Feed</Text>
            <Ionicons name="chevron-down" size={iw(14)} color={Colors.muted} />
          </View>
        </View>
      </View>

      <View style={styles.backBtn} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Layout.horizontal.lg,
    paddingBottom: Layout.vertical.md,
  },
  backBtn: {
    width: iw(36),
  },
  feedRow: {
    flex: 1,
    alignItems: "center",
  },
  feedPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingVertical: Layout.vertical.sm,
    paddingHorizontal: Layout.horizontal.lg,
  },
  postToText: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
    marginRight: Layout.horizontal.xxs,
  },
  avatarPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    gap: Layout.horizontal.xxs,
  },
  avatar: {
    width: iw(22),
    height: iw(22),
    borderRadius: 999,
    backgroundColor: Colors.label,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: {
    fontFamily: Typography.fonts.dm.bold,
    fontSize: Typography.sizes.xxxs,
    color: Colors.white,
  },
  feedLabel: {
    fontFamily: Typography.fonts.dm.semibold,
    fontSize: Typography.sizes.xs,
    color: Colors.black,
  },
});
