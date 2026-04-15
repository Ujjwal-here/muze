import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Layout } from "@/constants/layout";
import { iw } from "@/shared/utils/responsive";
import { Typography } from "@/constants/typography";
import { Colors } from "@/constants/colors";

const NOTIFICATIONS = [
  {
    id: "1",
    type: "like",
    user: "manoj",
    text: "liked your post",
    time: "2m ago",
  },
  {
    id: "2",
    type: "follow",
    user: "ferdowss",
    text: "started following you",
    time: "15m ago",
  },
  {
    id: "3",
    type: "comment",
    user: "manoj",
    text: "commented on your post",
    time: "1h ago",
  },
  {
    id: "4",
    type: "repost",
    user: "designdaily",
    text: "reposted your post",
    time: "3h ago",
  },
  {
    id: "5",
    type: "like",
    user: "indie_maker",
    text: "liked your comment",
    time: "5h ago",
  },
  {
    id: "6",
    type: "follow",
    user: "techcrunch",
    text: "started following you",
    time: "1d ago",
  },
];

const ICON_MAP: Record<string, { name: string; color: string }> = {
  like: { name: "heart", color: "#E24B4A" },
  follow: { name: "person-add", color: Colors.primary },
  comment: { name: "chatbubble", color: "#378ADD" },
  repost: { name: "repeat", color: "#1D9E75" },
};

export default function NotificationsScreen() {
  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {NOTIFICATIONS.map((notif) => {
          const icon = ICON_MAP[notif.type];
          return (
            <View key={notif.id} style={styles.notifItem}>
              <View
                style={[
                  styles.notifIcon,
                  { backgroundColor: icon.color + "15" },
                ]}
              >
                <Ionicons
                  name={icon.name as any}
                  size={iw(16)}
                  color={icon.color}
                />
              </View>
              <View style={styles.notifContent}>
                <Text style={styles.notifText}>
                  <Text style={styles.notifUser}>@{notif.user}</Text>{" "}
                  {notif.text}
                </Text>
                <Text style={styles.notifTime}>{notif.time}</Text>
              </View>
            </View>
          );
        })}

        <View style={styles.emptyEnd}>
          <Text style={styles.emptyTxt}>No more notifications</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingHorizontal: Layout.horizontal.lg,
    paddingTop: Layout.vertical["6xl"],
    paddingBottom: Layout.vertical.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: Typography.sizes.xl,
    color: Colors.black,
  },
  notifItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Layout.horizontal.lg,
    paddingVertical: Layout.vertical.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Layout.horizontal.sm,
  },
  notifIcon: {
    width: iw(36),
    height: iw(36),
    borderRadius: iw(18),
    alignItems: "center",
    justifyContent: "center",
  },
  notifContent: {
    flex: 1,
  },
  notifText: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.black,
    lineHeight: Typography.sizes.sm * 1.5,
  },
  notifUser: {
    fontFamily: Typography.fonts.semibold,
  },
  notifTime: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.xxs,
    color: Colors.muted,
    marginTop: 2,
  },
  emptyEnd: {
    alignItems: "center",
    paddingVertical: Layout.vertical["3xl"],
  },
  emptyTxt: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
  },
});
