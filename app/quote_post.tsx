import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, X, ImageIcon, PlayCircle } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { Layout } from "@/constants/layout";
import { iw, ih } from "@/shared/utils/responsive";
import { useAuth } from "@/context/auth";
import { quotePost, fetchPost } from "@/shared/services/posts";
import { supabase } from "@/shared/lib/supabase";
import { toast } from "sonner-native";
import type { PostWithMeta } from "@/shared/types/post";
import { PostAvatar } from "@/components/feed/PostAvatar";
import {
  MediaRenderer,
  parseMediaUrls,
} from "@/components/common/MediaRenderer";
import { formatDate } from "@/shared/utils/date";

const MAX_CHARS = 3000;
const STORAGE_BUCKET = "post-media";
const PLACEHOLDER =
  "Share something that inspires your followers, drop a laugh-out-loud meme, or ignite a bold debate in your community...";

type MediaItem = {
  uri: string;
  type: "image";
  fileName?: string;
  mimeType?: string;
};

function QuotePreviewCard({ post }: { post: PostWithMeta }) {
  const author = post.author;
  const displayName = author?.full_name || author?.username || "Unknown";
  const username = author?.username || "unknown";
  const bodyText =
    post.post_type === "quote" ? post.quote_content : post.content;
  const hasMedia = parseMediaUrls(post.media_urls).length > 0;

  return (
    <View style={styles.quoteCard}>
      {/* Header row: avatar + @username · displayName ............ date */}
      <View style={styles.quoteHeader}>
        <PostAvatar avatarUrl={author?.avatar_url} name={displayName} />
        <View style={styles.quoteNameRow}>
          <Text style={styles.quoteUsername} numberOfLines={1}>
            @{username}
          </Text>
          <Text style={styles.quoteDot}>·</Text>
          <Text style={styles.quoteDisplayName} numberOfLines={1}>
            {displayName}
          </Text>
        </View>
        <Text style={styles.quoteDate}>{formatDate(post.created_at)}</Text>
      </View>

      {/* Body text, full width */}
      {!!bodyText && (
        <Text style={styles.quoteContent} numberOfLines={4}>
          {bodyText}
        </Text>
      )}

      {/* Media preview, full width */}
      {hasMedia && (
        <View style={styles.quoteMediaWrap}>
          <MediaRenderer urls={post.media_urls} height={200} borderRadius={8} />
        </View>
      )}
    </View>
  );
}

export default function QuotePostScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [originalPost, setOriginalPost] = useState<PostWithMeta | null>(null);
  const [loadingPost, setLoadingPost] = useState(true);
  const [media, setMedia] = useState<MediaItem | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!postId) return;
    setLoadingPost(true);
    fetchPost(postId as string, user?.id ?? undefined)
      .then((p) => {
        if (p) setOriginalPost(p);
      })
      .catch(() => {})
      .finally(() => setLoadingPost(false));
  }, [postId, user?.id]);

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const canPost =
    (content.trim().length > 0 || media !== null) && !isOverLimit && !posting;

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      toast.error("Please allow access to your photo library to attach media.");
      return false;
    }
    return true;
  };

  const handlePickImage = async () => {
    if (posting) return;
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setMedia({
        uri: asset.uri,
        type: "image",
        fileName: asset.fileName ?? "image.jpg",
        mimeType: asset.mimeType ?? "image/jpeg",
      });
    }
  };

  const uploadMedia = async (item: MediaItem): Promise<string> => {
    const ext =
      item.uri.split(".").pop()?.split("?")[0]?.toLowerCase() || "jpg";

    const filePath = `${user!.id}/${Date.now()}.${ext}`;
    const contentType =
      item.mimeType || `image/${ext === "jpg" ? "jpeg" : ext}`;

    const { data: signedData, error: signedError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUploadUrl(filePath);

    if (signedError) throw signedError;

    const fileResponse = await fetch(item.uri);
    const blob = await fileResponse.blob();

    const uploadResponse = await fetch(signedData.signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
        "x-upsert": "false",
      },
      body: blob,
    });

    if (!uploadResponse.ok) {
      const text = await uploadResponse.text();
      throw new Error(`Upload failed: ${text}`);
    }

    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handlePost = async () => {
    if (!canPost || !user || !postId) return;
    setPosting(true);
    try {
      let mediaUrls: string[] | undefined;
      if (media) {
        const publicUrl = await uploadMedia(media);
        mediaUrls = [publicUrl];
      }

      await quotePost(user.id, {
        original_post_id: postId as string,
        quote_content: content.trim(),
        media_urls: mediaUrls,
      });
      router.replace("/(tabs)/home");
    } catch (err: any) {
      toast.error(err.message || "Failed to post. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={iw(22)} color={Colors.black} strokeWidth={1.75} />
        </Pressable>
        <Text style={styles.headerTitle}>Quote Post</Text>
        <View style={styles.backBtn} />
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Composer — no avatar, placeholder starts at the edge */}
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder={PLACEHOLDER}
            placeholderTextColor={Colors.placeholder}
            multiline
            autoFocus
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />

          {/* Selected image preview (with remove button) */}
          {media && (
            <View style={styles.mediaCard}>
              <Pressable
                style={styles.mediaClose}
                onPress={() => setMedia(null)}
                hitSlop={8}
              >
                <X size={iw(14)} color={Colors.black} strokeWidth={1.75} />
              </Pressable>
              <Image
                source={{ uri: media.uri }}
                style={styles.mediaThumb}
                resizeMode="cover"
              />
            </View>
          )}

          {/* Original post preview card */}
          {loadingPost ? (
            <View style={[styles.quoteCard, styles.quoteCardLoading]}>
              <ActivityIndicator size="small" color={Colors.muted} />
            </View>
          ) : originalPost ? (
            <QuotePreviewCard post={originalPost} />
          ) : null}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.charCount, isOverLimit && styles.charCountOver]}>
            {charCount} / {MAX_CHARS} Char
          </Text>

          <View style={styles.toolbarRow}>
            <Pressable
              style={[styles.toolBtn, !!media && styles.toolBtnDisabled]}
              onPress={handlePickImage}
              disabled={!!media || posting}
            >
              <ImageIcon
                size={iw(18)}
                color={media ? Colors.placeholder : Colors.muted}
                strokeWidth={1.75}
              />
            </Pressable>
            <Pressable
              style={[styles.toolBtn, styles.toolBtnDisabled]}
              disabled
            >
              <PlayCircle
                size={iw(18)}
                color={Colors.placeholder}
                strokeWidth={1.75}
              />
            </Pressable>
          </View>

          <Pressable
            style={[styles.postBtn, !canPost && styles.postBtnDisabled]}
            onPress={handlePost}
            disabled={!canPost}
          >
            {posting ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.postBtnTxt}>Post</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Layout.horizontal.md,
    paddingVertical: ih(12),
  },
  backBtn: {
    width: iw(36),
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: Typography.fonts.dm.semibold,
    fontSize: Typography.sizes.sm,
    color: Colors.black,
  },
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Layout.horizontal.lg,
    paddingTop: Layout.vertical.md,
    paddingBottom: Layout.vertical.md,
    gap: Layout.vertical.sm,
  },
  input: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.black,
    lineHeight: Typography.sizes.sm * 1.5,
    minHeight: ih(60),
    padding: 0,
  },

  /* ---------- Selected image preview ---------- */
  mediaCard: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Colors.inputBg,
    position: "relative",
  },
  mediaClose: {
    position: "absolute",
    top: Layout.vertical.sm,
    right: Layout.horizontal.sm,
    zIndex: 10,
    width: iw(24),
    height: iw(24),
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  mediaThumb: {
    width: "100%",
    height: ih(220),
    backgroundColor: Colors.border,
  },

  /* ---------- Quote preview card ---------- */
  quoteCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: Layout.horizontal.sm,
    backgroundColor: Colors.white,
  },
  quoteCardLoading: {
    minHeight: ih(80),
    alignItems: "center",
    justifyContent: "center",
  },
  quoteHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  quoteNameRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 0,
  },
  quoteUsername: {
    fontFamily: Typography.fonts.dm.semibold,
    fontSize: Typography.sizes.xs,
    color: Colors.black,
    flexShrink: 1,
  },
  quoteDot: {
    color: Colors.muted,
    fontSize: Typography.sizes.xs,
  },
  quoteDisplayName: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
    flexShrink: 1,
  },
  quoteDate: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xxs,
    color: Colors.muted,
    marginLeft: 8,
  },
  quoteContent: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xs,
    color: Colors.black,
    lineHeight: Typography.sizes.xs * 1.5,
    marginTop: Layout.vertical.xs,
  },
  quoteMediaWrap: {
    marginTop: Layout.vertical.sm,
    borderRadius: 8,
    overflow: "hidden",
  },

  /* ---------- Footer ---------- */
  footer: {
    paddingHorizontal: Layout.horizontal.lg,
    paddingTop: Layout.vertical.sm,
    paddingBottom: Layout.vertical.md,
    gap: Layout.vertical.sm,
  },
  charCount: {
    fontFamily: Typography.fonts.dm.medium,
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
    textAlign: "center",
  },
  charCountOver: {
    color: "#E53935",
  },
  toolbarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Layout.horizontal.sm,
  },
  toolBtn: {
    width: iw(36),
    height: iw(36),
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F2F2",
  },
  toolBtnDisabled: {
    opacity: 0.5,
  },
  postBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 999,
    paddingVertical: ih(14),
    alignItems: "center",
    justifyContent: "center",
  },
  postBtnDisabled: {
    opacity: 0.5,
  },
  postBtnTxt: {
    fontFamily: Typography.fonts.dm.semibold,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
  },
});
