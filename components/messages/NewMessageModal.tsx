// components/messages/NewMessageModal.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Search, X } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { Layout } from "@/constants/layout";
import { iw } from "@/shared/utils/responsive";
import { useAuth } from "@/context/auth";
import { searchProfiles, getOrCreateDM } from "@/shared/services/chat";
import type { Profile } from "@/shared/types/chat";

interface NewMessageModalProps {
  visible: boolean;
  onClose: () => void;
  onConversationReady: (args: {
    conversationId: string;
    profile: Profile;
  }) => void;
}

export function NewMessageModal({
  visible,
  onClose,
  onConversationReady,
}: NewMessageModalProps) {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setQuery("");
      setResults([]);
      setSearching(false);
      setCreating(false);
    }
  }, [visible]);

  const handleSearch = useCallback(
    (text: string) => {
      setQuery(text);
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (text.trim().length < 2) {
        setResults([]);
        setSearching(false);
        return;
      }

      setSearching(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const profiles = await searchProfiles(text.trim());
          setResults(profiles.filter((p) => p.id !== user?.id));
        } catch {
          setResults([]);
        } finally {
          setSearching(false);
        }
      }, 300);
    },
    [user],
  );

  const startDM = useCallback(
    async (profile: Profile) => {
      if (creating) return;
      setCreating(true);
      try {
        const conversationId = await getOrCreateDM(profile.id);
        onConversationReady({ conversationId, profile });
      } catch (err) {
        console.error("Failed to create DM:", err);
      } finally {
        setCreating(false);
      }
    },
    [creating, onConversationReady],
  );

  const renderItem = useCallback(
    ({ item }: { item: Profile }) => {
      const displayName = item.full_name || item.username;
      const initial = displayName.charAt(0).toUpperCase();

      return (
        <Pressable
          style={({ pressed }) => [
            styles.userItem,
            pressed && styles.userItemPressed,
          ]}
          onPress={() => startDM(item)}
          disabled={creating}
        >
          <View style={styles.userAvatar}>
            {item.avatar_url ? (
              <Image
                source={{ uri: item.avatar_url }}
                style={styles.userAvatarImg}
              />
            ) : (
              <Text style={styles.userAvatarTxt}>{initial}</Text>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.userHandle} numberOfLines={1}>
              @{item.username}
            </Text>
          </View>
        </Pressable>
      );
    },
    [startDM, creating],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.centerWrap}
          pointerEvents="box-none"
        >
          <Pressable style={styles.card} onPress={() => {}}>
            <View style={styles.header}>
              <Text style={styles.title}>New Message</Text>
              <Pressable
                onPress={onClose}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.closeBtn,
                  pressed && styles.closeBtnPressed,
                ]}
              >
                <X size={iw(16)} color={Colors.muted} strokeWidth={2} />
              </Pressable>
            </View>

            <View style={styles.divider} />

            <View style={styles.searchPill}>
              <Search size={iw(16)} color={Colors.primary} strokeWidth={2.25} />
              <TextInput
                value={query}
                onChangeText={handleSearch}
                placeholder="Search users..."
                placeholderTextColor={Colors.muted}
                style={styles.searchInput}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
            </View>

            <View style={styles.listWrap}>
              {searching ? (
                <View style={styles.stateCenter}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                </View>
              ) : query.trim().length < 2 ? (
                <View style={styles.stateCenter}>
                  <Text style={styles.stateText}>
                    Search by username or name
                  </Text>
                </View>
              ) : results.length === 0 ? (
                <View style={styles.stateCenter}>
                  <Text style={styles.stateText}>No users found</Text>
                </View>
              ) : (
                <FlatList
                  data={results}
                  keyExtractor={(item) => item.id}
                  renderItem={renderItem}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                />
              )}
            </View>

            {creating && (
              <View style={styles.creatingOverlay}>
                <ActivityIndicator size="large" color={Colors.primary} />
              </View>
            )}
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const CARD_WIDTH_PCT = "90%";
const CARD_MAX_HEIGHT_PCT = "75%";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlayModal,
  },
  centerWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Layout.horizontal.sm,
  },
  card: {
    width: CARD_WIDTH_PCT,
    maxHeight: CARD_MAX_HEIGHT_PCT,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: Layout.horizontal.md,
    paddingTop: Layout.vertical.md,
    paddingBottom: Layout.vertical.md,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: Layout.vertical.sm,
  },
  title: {
    fontFamily: Typography.fonts.dm.semibold,
    fontSize: Typography.sizes.xs,
    color: Colors.black,
  },
  closeBtn: {
    width: iw(28),
    height: iw(28),
    borderRadius: 999,
    backgroundColor: Colors.surfaceNeutral,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnPressed: {
    backgroundColor: Colors.border,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Layout.vertical.md,
  },
  searchPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: Layout.horizontal.xs,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 22,
    paddingHorizontal: Layout.horizontal.sm,
    height: Layout.vertical["2xl"],
    marginBottom: Layout.vertical.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xs,
    color: Colors.black,
    padding: 0,
  },
  listWrap: {
    minHeight: Layout.vertical["22xl"],
    maxHeight: Layout.vertical["32xl"],
  },
  stateCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Layout.vertical["2xl"],
  },
  stateText: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Layout.vertical.sm,
    paddingHorizontal: Layout.horizontal.xxs,
    gap: Layout.vertical.smMd,
    borderRadius: 10,
  },
  userItemPressed: {
    backgroundColor: Colors.surfacePressed,
  },
  userAvatar: {
    width: iw(40),
    height: iw(40),
    borderRadius: iw(20),
    backgroundColor: Colors.label,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  userAvatarImg: {
    width: "100%",
    height: "100%",
  },
  userAvatarTxt: {
    fontFamily: Typography.fonts.dm.bold,
    fontSize: Typography.sizes.xs,
    color: Colors.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: Typography.fonts.dm.semibold,
    fontSize: Typography.sizes.xs,
    color: Colors.black,
  },
  userHandle: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
    marginTop: 1,
  },
  creatingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.scrim,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: iw(18),
  },
});
