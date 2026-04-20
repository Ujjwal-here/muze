import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { router } from "expo-router";
import { toast } from "sonner-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { Layout } from "@/constants/layout";
import { iw, ih } from "@/shared/utils/responsive";
import { useAuth } from "@/context/auth";
import { createPost } from "@/shared/services/posts";
import { uploadToBucket } from "@/shared/services/upload";
import { useImagePicker, type PickedImage } from "@/hooks/useImagePicker";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { CharCount } from "@/components/common/CharCount";
import {
  MentionInput,
  type MentionInputHandle,
} from "@/components/common/MentionInput";
import { MediaPreview, PostToolbar } from "@/components/create-post";

const MAX_CHARS = 3000;
const PLACEHOLDER =
  "Share something that inspires your followers, drop a laugh-out-loud meme, or ignite a bold debate in your community...";

export default function CreatePostScreen() {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [media, setMedia] = useState<PickedImage | null>(null);
  const inputRef = useRef<MentionInputHandle>(null);
  const pickImage = useImagePicker();

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const canPost =
    (content.trim().length > 0 || media !== null) && !isOverLimit && !posting;

  const handlePost = async () => {
    if (!canPost || !user) return;
    setPosting(true);
    try {
      let mediaUrls: string[] = [];
      if (media) {
        const publicUrl = await uploadToBucket(media.uri, user.id, {
          mimeType: media.mimeType,
        });
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
    const picked = await pickImage({ allowsEditing: true });
    if (picked) setMedia(picked);
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
          <MentionInput
            ref={inputRef}
            value={content}
            onChangeText={setContent}
            placeholder={PLACEHOLDER}
            placeholderTextColor={Colors.placeholder}
            multiline
            autoFocus
            textAlignVertical="top"
            inputStyle={styles.input}
            suggestionAnchor="below"
          />

          {media && (
            <MediaPreview uri={media.uri} onRemove={() => setMedia(null)} />
          )}
        </ScrollView>

        <View style={styles.footer}>
          <CharCount count={charCount} max={MAX_CHARS} />
          <PostToolbar
            onPickImage={handlePickImage}
            imagePicked={!!media}
            disabled={posting}
          />
          <PrimaryButton
            label="Post"
            loadingLabel="Uploading..."
            onPress={handlePost}
            loading={posting}
            disabled={!canPost}
          />
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
    paddingVertical: Layout.vertical.sm,
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
    minHeight: Layout.vertical["3xl"],
    padding: 0,
  },
  footer: {
    paddingHorizontal: Layout.horizontal.lg,
    paddingTop: Layout.vertical.sm,
    paddingBottom: Layout.vertical.md,
    gap: Layout.vertical.sm,
  },
});
