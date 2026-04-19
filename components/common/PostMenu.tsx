import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Trash2 } from "lucide-react-native";
import { toast } from "sonner-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { Layout } from "@/constants/layout";
import { iw, ih } from "@/shared/utils/responsive";
import { deletePost } from "@/shared/services/posts";
import type { PostWithMeta } from "@/shared/types/post";

interface PostMenuProps {
  post: PostWithMeta;
  currentUserId?: string;
  visible: boolean;
  onClose: () => void;
  onDeleted?: (postId: string) => void;
}

export function PostMenu({
  post,
  currentUserId,
  visible,
  onClose,
  onDeleted,
}: PostMenuProps) {
  const isOwner = post.user_id === currentUserId;

  const handleDelete = () => {
    onClose();
    toast("Delete this post?", {
      description: "This cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await deletePost(post.id);
            onDeleted?.(post.id);
            toast.success("Post deleted.");
          } catch (err: any) {
            toast.error(err.message || "Failed to delete post.");
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
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

        {isOwner && (
          <MenuItem
            icon={<Trash2 size={iw(20)} color="#E53935" strokeWidth={1.75} />}
            label="Delete post"
            onPress={handleDelete}
            danger
          />
        )}

        <Pressable style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelTxt}>Cancel</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.menuItemPressed,
      ]}
      onPress={onPress}
    >
      {icon}
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
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
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginBottom: ih(16),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Layout.horizontal.md,
    paddingVertical: ih(14),
    borderRadius: iw(10),
    paddingHorizontal: Layout.horizontal.sm,
  },
  menuItemPressed: {
    backgroundColor: Colors.inputBg,
  },
  menuLabel: {
    fontFamily: Typography.fonts.dm.medium,
    fontSize: Typography.sizes.sm,
    color: Colors.black,
  },
  menuLabelDanger: {
    color: "#E53935",
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: ih(4),
  },
  cancelBtn: {
    marginTop: ih(8),
    paddingVertical: ih(14),
    alignItems: "center",
    borderRadius: iw(10),
    backgroundColor: Colors.inputBg,
  },
  cancelTxt: {
    fontFamily: Typography.fonts.dm.semibold,
    fontSize: Typography.sizes.sm,
    color: Colors.black,
  },
});
