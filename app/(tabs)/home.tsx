import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Layout } from "@/constants/layout";
import { iw } from "@/shared/utils/responsive";
import { Typography } from "@/constants/typography";
import { Colors } from "@/constants/colors";

const TABS = ["Following", "All Muze"] as const;

const DUMMY_POSTS = [
  {
    id: "1",
    username: "manoj",
    displayName: "Manoj Adithya",
    date: "Apr 10",
    content:
      "Setbacks and delays aren't roadblocks, they're part of the journey. What matters is how you navigate them and turn challenges into wins.",
    likes: 13,
    comments: 2,
    views: 40,
  },
  {
    id: "2",
    username: "ferdowss",
    displayName: "Ferdows Sanehi",
    date: "Apr 10",
    content:
      "Farmers and Lorry drivers who are self employed or contractors (mostly all of them) have gone on strike across Ireland and France.",
    likes: 10,
    comments: 0,
    views: 29,
  },
  {
    id: "3",
    username: "manoj",
    displayName: "Manoj Adithya",
    date: "Apr 9",
    content:
      "At Muze, we faced our fair share of setbacks. But as a team, we leaned into our strengths, worked through our weaknesses, and reached our goal.",
    likes: 13,
    comments: 1,
    views: 40,
  },
  {
    id: "4",
    username: "ferdowss",
    displayName: "Ferdows Sanehi",
    date: "Apr 5",
    content: "The guy has lost his mind on Easter Sunday.",
    likes: 5,
    comments: 0,
    views: 15,
  },
];

function PostCard({ post }: { post: (typeof DUMMY_POSTS)[0] }) {
  const initial = post.displayName.charAt(0).toUpperCase();

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.postAvatar}>
          <Text style={styles.postAvatarTxt}>{initial}</Text>
        </View>
        <View style={styles.postMeta}>
          <View style={styles.postNameRow}>
            <Text style={styles.postUsername}>@{post.username}</Text>
            <Text style={styles.postDot}>&middot;</Text>
            <Text style={styles.postDisplayName}>{post.displayName}</Text>
          </View>
          <Text style={styles.postDate}>{post.date}</Text>
        </View>
      </View>

      <Text style={styles.postContent}>{post.content}</Text>

      <View style={styles.postActions}>
        <Pressable style={styles.actionItem}>
          <Ionicons
            name="arrow-undo-outline"
            size={iw(16)}
            color={Colors.muted}
          />
        </Pressable>
        <Pressable style={styles.actionItem}>
          <Ionicons
            name="thumbs-up-outline"
            size={iw(16)}
            color={Colors.muted}
          />
          <Text style={styles.actionCount}>{post.likes}</Text>
        </Pressable>
        <Pressable style={styles.actionItem}>
          <Ionicons
            name="thumbs-down-outline"
            size={iw(16)}
            color={Colors.muted}
          />
        </Pressable>
        <Pressable style={styles.actionItem}>
          <Ionicons
            name="chatbubble-outline"
            size={iw(14)}
            color={Colors.muted}
          />
          <Text style={styles.actionCount}>{post.comments}</Text>
        </Pressable>
        <Pressable style={styles.actionItem}>
          <Ionicons name="repeat-outline" size={iw(16)} color={Colors.muted} />
        </Pressable>
        <View style={styles.actionSpacer} />
        <View style={styles.actionItem}>
          <Ionicons name="eye-outline" size={iw(14)} color={Colors.muted} />
          <Text style={styles.actionCount}>{post.views}</Text>
        </View>
        <Pressable style={styles.actionItem}>
          <Ionicons
            name="ellipsis-horizontal"
            size={iw(16)}
            color={Colors.muted}
          />
        </Pressable>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]>("Following");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Image
          source={require("@/assets/images/muze-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.headerRight}>
          <Text style={styles.latestTxt}>Latest</Text>
          <Ionicons name="chevron-down" size={iw(14)} color={Colors.muted} />
        </View>
      </View>

      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[styles.tabTxt, activeTab === tab && styles.tabTxtActive]}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          style={styles.feed}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.feedContent}
        >
          {DUMMY_POSTS.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          <View style={styles.endOfFeed}>
            <Text style={styles.endOfFeedTxt}>You're all caught up</Text>
          </View>
        </ScrollView>
      </Animated.View>

      <Pressable style={styles.fab}>
        <Ionicons name="pencil" size={iw(22)} color={Colors.white} />
      </Pressable>
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
    paddingBottom: Layout.vertical.sm,
  },
  logo: {
    width: iw(32),
    height: iw(32),
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Layout.horizontal.xxs,
  },
  latestTxt: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: Layout.horizontal.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    paddingVertical: Layout.vertical.sm,
    paddingHorizontal: Layout.horizontal.md,
    marginRight: Layout.horizontal.sm,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabTxt: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.sm,
    color: Colors.muted,
  },
  tabTxtActive: {
    color: Colors.black,
    fontFamily: Typography.fonts.semibold,
  },
  feed: {
    flex: 1,
  },
  feedContent: {
    paddingBottom: Layout.vertical["3xl"],
  },
  postCard: {
    paddingHorizontal: Layout.horizontal.lg,
    paddingVertical: Layout.vertical.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Layout.vertical.sm,
  },
  postAvatar: {
    width: iw(36),
    height: iw(36),
    borderRadius: iw(18),
    backgroundColor: Colors.label,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Layout.horizontal.sm,
  },
  postAvatarTxt: {
    fontFamily: Typography.fonts.bold,
    fontSize: Typography.sizes.xs,
    color: Colors.white,
  },
  postMeta: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  postNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Layout.horizontal.xxs,
  },
  postUsername: {
    fontFamily: Typography.fonts.semibold,
    fontSize: Typography.sizes.xs,
    color: Colors.black,
  },
  postDot: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
  },
  postDisplayName: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.xs,
    color: Colors.subtitle,
  },
  postDate: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.xxs,
    color: Colors.muted,
  },
  postContent: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.black,
    lineHeight: Typography.sizes.sm * 1.6,
    marginBottom: Layout.vertical.md,
  },
  postActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Layout.horizontal.md,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Layout.horizontal.xxs,
  },
  actionCount: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.xxs,
    color: Colors.muted,
  },
  actionSpacer: {
    flex: 1,
  },
  endOfFeed: {
    alignItems: "center",
    paddingVertical: Layout.vertical["3xl"],
  },
  endOfFeedTxt: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
  },
  fab: {
    position: "absolute",
    bottom: Layout.vertical.lg,
    right: Layout.horizontal.lg,
    width: iw(50),
    height: iw(50),
    borderRadius: iw(25),
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
