import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
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
import { useTheme } from "@/context/theme";
import type { ThemeColors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { fetchFeed } from "@/shared/services/posts";
import type { PostWithMeta } from "@/shared/types/post";
import { PostCard, FeedTopBar, FeedEmptyState } from "@/components/feed";
import type { FeedTab } from "@/components/feed";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";

export default function HomeScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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

  const handleLikeChange = useCallback(
    (postId: string, liked: boolean, count: number) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, is_liked: liked, likes_count: count } : p,
        ),
      );
    },
    [],
  );

  const handleDislikeChange = useCallback(
    (postId: string, disliked: boolean) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, is_disliked: disliked } : p,
        ),
      );
    },
    [],
  );

  const handleDeleted = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  return (
    <ScreenWrapper scrollable={false} style={styles.root}>
      <FeedTopBar activeTab={activeTab} onTabChange={setActiveTab} />

      {loading || authLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
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
                tintColor={colors.primary}
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
                  onDislikeChange={handleDislikeChange}
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
        <Pencil size={iw(22)} color={colors.white} strokeWidth={1.75} />
      </Pressable>
    </ScreenWrapper>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { backgroundColor: colors.surfaceMuted },
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
      color: colors.muted,
      textAlign: "center",
      paddingHorizontal: Layout.horizontal.lg,
    },
    retryBtn: {
      paddingHorizontal: Layout.horizontal.sm,
      paddingVertical: 8,
      backgroundColor: colors.primary,
      borderRadius: 20,
    },
    retryTxt: {
      fontFamily: Typography.fonts.dm.semibold,
      fontSize: Typography.sizes.sm,
      color: colors.white,
    },
    endOfFeed: {
      alignItems: "center",
      paddingVertical: Layout.vertical["3xl"],
      gap: Layout.vertical.sm,
    },
    endOfFeedTxt: {
      fontFamily: Typography.fonts.dm.regular,
      fontSize: Typography.sizes.xs,
      color: colors.muted,
    },
    logoutBtn: {
      paddingHorizontal: Layout.horizontal.sm,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    logoutTxt: {
      fontFamily: Typography.fonts.dm.medium,
      fontSize: Typography.sizes.xs,
      color: colors.muted,
    },
    fab: {
      position: "absolute",
      bottom: Layout.vertical.lg,
      right: Layout.horizontal.lg,
      width: iw(50),
      height: iw(50),
      borderRadius: 999,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      elevation: 4,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
  });
