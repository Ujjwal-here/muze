import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
  Share,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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

  const handleCopyLink = async () => {
    onClose();
    try {
      await Share.share({
        message: `Check out this post on Muze!`,
        url: `muze://post/${post.id}`,
      });
    } catch {}
  };

  const handleDelete = () => {
    onClose();
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePost(post.id);
              onDeleted?.(post.id);
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to delete post.");
            }
          },
        },
      ],
    );
  };

  const handleEdit = () => {
    onClose();
    // Edit screen can be wired later
    Alert.alert("Coming soon", "Post editing will be available soon.");
  };

  const handlePin = () => {
    onClose();
    Alert.alert("Coming soon", "Pinning to profile will be available soon.");
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
        {/* Handle bar */}
        <View style={styles.handle} />

        {isOwner && (
          <MenuItem
            icon="create-outline"
            label="Edit Post"
            onPress={handleEdit}
          />
        )}

        <MenuItem
          icon="link-outline"
          label="Copy link to post"
          onPress={handleCopyLink}
        />

        {isOwner && (
          <MenuItem
            icon="pin-outline"
            label="Pin to Profile"
            onPress={handlePin}
          />
        )}

        {isOwner && <View style={styles.menuDivider} />}

        {isOwner && (
          <MenuItem
            icon="trash-outline"
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
  icon: string;
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
      <Ionicons
        name={icon as any}
        size={iw(20)}
        color={danger ? "#E53935" : Colors.black}
      />
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
    fontFamily: Typography.fonts.medium,
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
    fontFamily: Typography.fonts.semibold,
    fontSize: Typography.sizes.sm,
    color: Colors.black,
  },
});
