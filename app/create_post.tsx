import React, { useState, useRef } from "react";
import { TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { toast } from "sonner-native";
import { useAuth } from "@/context/auth";
import { supabase } from "@/shared/lib/supabase";
import { createPost } from "@/shared/services/posts";
import { ScreenWrapper } from "@/components/ui";
import { PostHeader, PostComposer, PostFooter } from "@/components/create-post";
import { Colors } from "@/constants/colors";

const MAX_CHARS = 3000;
const STORAGE_BUCKET = "post-media";

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

  const initial = user?.email?.charAt(0).toUpperCase() ?? "?";

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

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      toast.error("Please allow access to your photo library to attach media.");
      return false;
    }
    return true;
  };

  const handlePickImage = async () => {
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

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.white }}
      edges={["top"]}
    >
      <ScreenWrapper scrollable={false}>
        <PostHeader initial={initial} />

        <PostComposer
          inputRef={inputRef}
          content={content}
          onChangeText={setContent}
          media={media}
          onRemoveMedia={() => setMedia(null)}
        />

        <PostFooter
          charCount={charCount}
          maxChars={MAX_CHARS}
          isOverLimit={isOverLimit}
          canPost={canPost}
          posting={posting}
          onPickImage={handlePickImage}
          onPost={handlePost}
        />
      </ScreenWrapper>
    </SafeAreaView>
  );
}
