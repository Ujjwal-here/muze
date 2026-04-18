import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Pressable,
  ScrollView,
  Animated,
  RefreshControl,
  ActivityIndicator,
  Text,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { iw } from "@/shared/utils/responsive";
import { Layout } from "@/constants/layout";
import { Typography } from "@/constants/typography";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/auth";
import { fetchFeed } from "@/shared/services/posts";
import type { PostWithMeta } from "@/shared/types/post";
import { PostCard, FeedTopBar, FeedEmptyState } from "@/components/feed";
import type { FeedTab } from "@/components/feed";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";

export default function HomeScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<FeedTab>("Following");
  const [posts, setPosts] = useState<PostWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadPosts = useCallback(
    async (isRefresh = false) => {
      if (!user) return;
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);
        const feedType = activeTab === "Following" ? "following" : "discover";
        const data = await fetchFeed(user.id, { feed_type: feedType });
        setPosts(data);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      } catch (err: any) {
        setError(err.message || "Failed to load posts");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user, activeTab],
  );

  useEffect(() => {
    fadeAnim.setValue(0);
    loadPosts();
  }, [loadPosts]);

  const handleLikeChange = (postId: string, liked: boolean, count: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, is_liked: liked, likes_count: count } : p,
      ),
    );
  };

  const handleDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <ScreenWrapper scrollable={false} style={styles.root}>
      <FeedTopBar activeTab={activeTab} onTabChange={setActiveTab} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorTxt}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={() => loadPosts()}>
            <Text style={styles.retryTxt}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView
            style={styles.feed}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.feedContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadPosts(true)}
                tintColor={Colors.primary}
              />
            }
          >
            {posts.length === 0 ? (
              <FeedEmptyState activeTab={activeTab} />
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id}
                  onLikeChange={handleLikeChange}
                  onDeleted={handleDeleted}
                />
              ))
            )}

            <View style={styles.endOfFeed}>
              <Text style={styles.endOfFeedTxt}>You're all caught up</Text>
            </View>
          </ScrollView>
        </Animated.View>
      )}

      <Pressable style={styles.fab} onPress={() => router.push("/create_post")}>
        <Ionicons name="pencil" size={iw(22)} color={Colors.white} />
      </Pressable>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: "#F5F5F5" },
  feed: { flex: 1 },
  feedContent: { paddingBottom: Layout.vertical["3xl"] },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Layout.vertical.md,
  },
  errorTxt: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.muted,
    textAlign: "center",
    paddingHorizontal: Layout.horizontal.lg,
  },
  retryBtn: {
    paddingHorizontal: iw(20),
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: iw(20),
  },
  retryTxt: {
    fontFamily: Typography.fonts.dm.semibold,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
  },
  endOfFeed: {
    alignItems: "center",
    paddingVertical: Layout.vertical["3xl"],
  },
  endOfFeedTxt: {
    fontFamily: Typography.fonts.dm.regular,
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
