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
import { Pencil } from "lucide-react-native";
import { router, useFocusEffect } from "expo-router";
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
  const { user, loading: authLoading, signOut } = useAuth();
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
    if (authLoading) return;
    fadeAnim.setValue(0);
    loadPosts();
  }, [authLoading, loadPosts]);

  const didInitialFocusRef = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!didInitialFocusRef.current) {
        didInitialFocusRef.current = true;
        return;
      }
      loadPosts(true);
    }, [loadPosts]),
  );

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

      {loading || authLoading ? (
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
              <Pressable onPress={signOut} style={styles.logoutBtn}>
                <Text style={styles.logoutTxt}>Log out</Text>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
      )}

      <Pressable style={styles.fab} onPress={() => router.push("/create_post")}>
        <Pencil size={iw(22)} color={Colors.white} strokeWidth={1.75} />
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
    paddingHorizontal: Layout.horizontal.sm,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  retryTxt: {
    fontFamily: Typography.fonts.dm.semibold,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
  },
  endOfFeed: {
    alignItems: "center",
    paddingVertical: Layout.vertical["3xl"],
    gap: Layout.vertical.sm,
  },
  endOfFeedTxt: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
  },
  logoutBtn: {
    paddingHorizontal: Layout.horizontal.sm,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoutTxt: {
    fontFamily: Typography.fonts.dm.medium,
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
  },
  fab: {
    position: "absolute",
    bottom: Layout.vertical.lg,
    right: Layout.horizontal.lg,
    width: iw(50),
    height: iw(50),
    borderRadius: 999,
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
