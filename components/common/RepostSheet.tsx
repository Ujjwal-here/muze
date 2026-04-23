import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { Repeat2, Quote } from "lucide-react-native";
import { toast } from "sonner-native";
import { useTheme } from "@/context/theme";
import type { ThemeColors } from "@/constants/theme";
import { Typography } from "@/constants/typography";
import { Layout } from "@/constants/layout";
import { iw, ih } from "@/shared/utils/responsive";
import { repost, undoRepost } from "@/shared/services/posts";
import type { PostWithMeta } from "@/shared/types/post";

interface RepostSheetProps {
  post: PostWithMeta;
  visible: boolean;
  isReposted: boolean;
  onClose: () => void;
  onRepostChange: (reposted: boolean) => void;
  onQuote: () => void;
}

export function RepostSheet({
  post,
  visible,
  isReposted,
  onClose,
  onRepostChange,
  onQuote,
}: RepostSheetProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [loading, setLoading] = useState(false);

  const handleRepost = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (isReposted) {
        await undoRepost(post.id);
        onRepostChange(false);
      } else {
        await repost({ original_post_id: post.id });
        onRepostChange(true);
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuote = () => {
    onClose();
    onQuote();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        <View style={styles.handle} />

        <Pressable
          style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          onPress={handleRepost}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color={isReposted ? colors.primary : colors.muted}
            />
          ) : (
            <Repeat2
              size={iw(18)}
              color={isReposted ? colors.primary : colors.muted}
              strokeWidth={1.75}
            />
          )}
          <Text style={[styles.label, isReposted && styles.labelActive]}>
            {isReposted ? "Undo Repost" : "Repost"}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          onPress={handleQuote}
        >
          <Quote size={iw(18)} color={colors.muted} strokeWidth={1.75} />
          <Text style={styles.label}>Repost with Quote</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlayModal,
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: iw(20),
    borderTopRightRadius: iw(20),
    paddingTop: ih(10),
    paddingBottom: ih(40),
    paddingHorizontal: Layout.horizontal.lg,
  },
  handle: {
    width: iw(36),
    height: ih(4),
    borderRadius: iw(2),
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: ih(12),
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: Layout.horizontal.md,
    paddingVertical: ih(12),
    paddingHorizontal: Layout.horizontal.sm,
    borderRadius: iw(8),
  },
  itemPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  label: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.sm,
    color: colors.black,
  },
  labelActive: {
    color: colors.primary,
  },
});
