import React, { useState, useRef } from "react";
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
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { toast } from "sonner-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { Layout } from "@/constants/layout";
import { iw, ih } from "@/shared/utils/responsive";
import { useAuth } from "@/context/auth";
import { supabase } from "@/shared/lib/supabase";
import { createPost } from "@/shared/services/posts";

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

export default function CreatePostScreen() {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [media, setMedia] = useState<MediaItem | null>(null);
  const inputRef = useRef<TextInput>(null);

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const canPost =
    (content.trim().length > 0 || media !== null) && !isOverLimit && !posting;

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
      headers: { "Content-Type": contentType, "x-upsert": "false" },
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
    if (!canPost || !user) return;
    setPosting(true);
    try {
      let mediaUrls: string[] = [];
      if (media) {
        const publicUrl = await uploadMedia(media);
        mediaUrls = [publicUrl];
      }
      await createPost(user.id, {
        content: content.trim() || undefined,
        media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
      });
      router.replace("/(tabs)/home");
    } catch (err: any) {
      toast.error(err.message || "Failed to post. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      toast.error("Please allow access to your photo library to attach media.");
      return;
    }
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

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={iw(22)} color={Colors.black} strokeWidth={1.75} />
        </Pressable>
        <Text style={styles.headerTitle}>Create Post</Text>
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
        </ScrollView>

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
  flex: { flex: 1 },
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
