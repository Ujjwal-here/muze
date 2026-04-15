import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Layout } from "@/constants/layout";
import { iw } from "@/shared/utils/responsive";
import { Typography } from "@/constants/typography";
import { Colors } from "@/constants/colors";

const TRENDING = [
  { id: "1", tag: "Technology", posts: "2.4k posts" },
  { id: "2", tag: "Startups", posts: "1.8k posts" },
  { id: "3", tag: "Design", posts: "956 posts" },
  { id: "4", tag: "AI & ML", posts: "3.1k posts" },
  { id: "5", tag: "Remote Work", posts: "1.2k posts" },
];

const SUGGESTED = [
  {
    id: "1",
    username: "designdaily",
    displayName: "Design Daily",
    bio: "Curating the best design inspiration",
  },
  {
    id: "2",
    username: "techcrunch",
    displayName: "Tech Crunch",
    bio: "Breaking tech news and analysis",
  },
  {
    id: "3",
    username: "indie_maker",
    displayName: "Indie Maker",
    bio: "Building products in public",
  },
];

export default function SearchScreen() {
  const [query, setQuery] = useState("");

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={iw(18)} color={Colors.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Muze"
          placeholderTextColor={Colors.placeholder}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Trending</Text>
        {TRENDING.map((item) => (
          <Pressable key={item.id} style={styles.trendingItem}>
            <View style={styles.trendingIcon}>
              <Ionicons
                name="trending-up"
                size={iw(16)}
                color={Colors.primary}
              />
            </View>
            <View>
              <Text style={styles.trendingTag}>{item.tag}</Text>
              <Text style={styles.trendingCount}>{item.posts}</Text>
            </View>
          </Pressable>
        ))}

        <Text style={styles.sectionTitle}>Suggested for you</Text>
        {SUGGESTED.map((item) => (
          <View key={item.id} style={styles.suggestedItem}>
            <View style={styles.suggestedAvatar}>
              <Text style={styles.suggestedAvatarTxt}>
                {item.displayName.charAt(0)}
              </Text>
            </View>
            <View style={styles.suggestedInfo}>
              <Text style={styles.suggestedName}>{item.displayName}</Text>
              <Text style={styles.suggestedUsername}>@{item.username}</Text>
              <Text style={styles.suggestedBio}>{item.bio}</Text>
            </View>
            <Pressable style={styles.followBtn}>
              <Text style={styles.followBtnTxt}>Follow</Text>
            </Pressable>
          </View>
        ))}

        <View style={{ height: Layout.vertical["3xl"] }} />
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
    paddingBottom: Layout.vertical.sm,
  },
  headerTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: Typography.sizes.xl,
    color: Colors.black,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Layout.horizontal.lg,
    marginBottom: Layout.vertical.lg,
    paddingHorizontal: Layout.horizontal.sm,
    height: iw(40),
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Layout.horizontal.xs,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.black,
  },
  sectionTitle: {
    fontFamily: Typography.fonts.semibold,
    fontSize: Typography.sizes.base,
    color: Colors.black,
    paddingHorizontal: Layout.horizontal.lg,
    paddingTop: Layout.vertical.lg,
    paddingBottom: Layout.vertical.sm,
  },
  trendingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Layout.horizontal.lg,
    paddingVertical: Layout.vertical.sm,
    gap: Layout.horizontal.sm,
  },
  trendingIcon: {
    width: iw(34),
    height: iw(34),
    borderRadius: iw(17),
    backgroundColor: Colors.inputBg,
    alignItems: "center",
    justifyContent: "center",
  },
  trendingTag: {
    fontFamily: Typography.fonts.semibold,
    fontSize: Typography.sizes.sm,
    color: Colors.black,
  },
  trendingCount: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.xxs,
    color: Colors.muted,
  },
  suggestedItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Layout.horizontal.lg,
    paddingVertical: Layout.vertical.sm,
    gap: Layout.horizontal.sm,
  },
  suggestedAvatar: {
    width: iw(40),
    height: iw(40),
    borderRadius: iw(20),
    backgroundColor: Colors.label,
    alignItems: "center",
    justifyContent: "center",
  },
  suggestedAvatarTxt: {
    fontFamily: Typography.fonts.bold,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
  },
  suggestedInfo: {
    flex: 1,
  },
  suggestedName: {
    fontFamily: Typography.fonts.semibold,
    fontSize: Typography.sizes.sm,
    color: Colors.black,
  },
  suggestedUsername: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.xxs,
    color: Colors.muted,
  },
  suggestedBio: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.xxs,
    color: Colors.subtitle,
    marginTop: 2,
  },
  followBtn: {
    paddingHorizontal: Layout.horizontal.md,
    paddingVertical: Layout.vertical.xs,
    borderRadius: 20,
    backgroundColor: Colors.primary,
  },
  followBtnTxt: {
    fontFamily: Typography.fonts.semibold,
    fontSize: Typography.sizes.xxs,
    color: Colors.white,
  },
});
