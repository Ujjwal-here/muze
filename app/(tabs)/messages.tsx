import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Layout } from "@/constants/layout";
import { iw } from "@/shared/utils/responsive";
import { Typography } from "@/constants/typography";
import { Colors } from "@/constants/colors";

const CONVERSATIONS = [
  {
    id: "1",
    name: "Manoj Adithya",
    username: "manoj",
    lastMessage: "Hey, check out the latest update!",
    time: "2m",
    unread: true,
  },
  {
    id: "2",
    name: "Ferdows Sanehi",
    username: "ferdowss",
    lastMessage: "Thanks for the follow back",
    time: "1h",
    unread: false,
  },
  {
    id: "3",
    name: "Design Daily",
    username: "designdaily",
    lastMessage: "Would love to collaborate on something",
    time: "3h",
    unread: true,
  },
  {
    id: "4",
    name: "Indie Maker",
    username: "indie_maker",
    lastMessage: "Congrats on the launch!",
    time: "1d",
    unread: false,
  },
];

export default function MessagesScreen() {
  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Pressable>
          <Ionicons name="create-outline" size={iw(22)} color={Colors.black} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {CONVERSATIONS.map((convo) => (
          <Pressable key={convo.id} style={styles.convoItem}>
            <View style={styles.convoAvatar}>
              <Text style={styles.convoAvatarTxt}>{convo.name.charAt(0)}</Text>
            </View>
            <View style={styles.convoContent}>
              <View style={styles.convoTop}>
                <Text style={styles.convoName}>{convo.name}</Text>
                <Text style={styles.convoTime}>{convo.time}</Text>
              </View>
              <Text
                style={[styles.convoMsg, convo.unread && styles.convoMsgUnread]}
                numberOfLines={1}
              >
                {convo.lastMessage}
              </Text>
            </View>
            {convo.unread && <View style={styles.unreadDot} />}
          </Pressable>
        ))}

        <View style={styles.emptyEnd}>
          <Ionicons
            name="chatbubbles-outline"
            size={iw(40)}
            color={Colors.border}
          />
          <Text style={styles.emptyTxt}>Start a conversation</Text>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  convoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Layout.horizontal.lg,
    paddingVertical: Layout.vertical.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Layout.horizontal.sm,
  },
  convoAvatar: {
    width: iw(44),
    height: iw(44),
    borderRadius: iw(22),
    backgroundColor: Colors.label,
    alignItems: "center",
    justifyContent: "center",
  },
  convoAvatarTxt: {
    fontFamily: Typography.fonts.bold,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
  },
  convoContent: {
    flex: 1,
  },
  convoTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  convoName: {
    fontFamily: Typography.fonts.semibold,
    fontSize: Typography.sizes.sm,
    color: Colors.black,
  },
  convoTime: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.xxs,
    color: Colors.muted,
  },
  convoMsg: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
  },
  convoMsgUnread: {
    color: Colors.black,
    fontFamily: Typography.fonts.medium,
  },
  unreadDot: {
    width: iw(8),
    height: iw(8),
    borderRadius: iw(4),
    backgroundColor: Colors.primary,
  },
  emptyEnd: {
    alignItems: "center",
    paddingVertical: Layout.vertical["5xl"],
    gap: Layout.vertical.sm,
  },
  emptyTxt: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
  },
});
