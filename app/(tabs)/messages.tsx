import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native";
import { Search, Plus, MessageCircle } from "lucide-react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Layout } from "@/constants/layout";
import { iw } from "@/shared/utils/responsive";
import { Typography } from "@/constants/typography";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/auth";
import { fetchInbox, subscribeToInbox } from "@/shared/services/chat";
import type { InboxItem, Profile } from "@/shared/types/chat";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { NewMessageModal, ConversationRow } from "@/components/messages";

export default function MessagesScreen() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [newMsgOpen, setNewMsgOpen] = useState(false);
  const readFloorsRef = useRef<Map<string, string>>(new Map());

  const applyReadFloors = useCallback((items: InboxItem[]): InboxItem[] => {
    const floors = readFloorsRef.current;
    if (floors.size === 0) return items;
    return items.map((item) => {
      const floor = floors.get(item.conversation_id);
      if (!floor || !item.last_message_at) return item;
      if (new Date(item.last_message_at) <= new Date(floor)) {
        return { ...item, has_unread: false, unread_count: 0 };
      }
      return item;
    });
  }, []);

  const loadInbox = useCallback(async () => {
    if (!user) return;
    try {
      const items = await fetchInbox(user.id);
      setInbox(applyReadFloors(items));
    } catch (err) {
      console.error("Failed to load inbox:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, applyReadFloors]);

  const loadInboxRef = useRef(loadInbox);
  useEffect(() => {
    loadInboxRef.current = loadInbox;
  }, [loadInbox]);

  useEffect(() => {
    if (authLoading || !user) return;
    loadInbox();
  }, [authLoading, user, loadInbox]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      loadInbox();
    }, [loadInbox, user]),
  );

  useEffect(() => {
    if (!user?.id) return;
    const unsubscribe = subscribeToInbox(user.id, () => {
      loadInboxRef.current();
    });
    return unsubscribe;
  }, [user?.id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadInbox();
  }, [loadInbox]);

  const openChat = (item: InboxItem) => {
    const floor = item.last_message_at ?? new Date().toISOString();
    readFloorsRef.current.set(item.conversation_id, floor);

    setInbox((prev) =>
      prev.map((c) =>
        c.conversation_id === item.conversation_id
          ? { ...c, has_unread: false, unread_count: 0 }
          : c,
      ),
    );

    router.push({
      pathname: "/chat/[conversationId]",
      params: {
        conversationId: item.conversation_id,
        otherUserId: item.other_user_id,
        otherUsername: item.other_username,
        otherFullName: item.other_full_name,
        otherAvatarUrl: item.other_avatar_url ?? "",
      },
    });
  };

  const handleConversationReady = useCallback(
    ({
      conversationId,
      profile,
    }: {
      conversationId: string;
      profile: Profile;
    }) => {
      setNewMsgOpen(false);
      router.push({
        pathname: "/chat/[conversationId]",
        params: {
          conversationId,
          otherUserId: profile.id,
          otherUsername: profile.username,
          otherFullName: profile.full_name,
          otherAvatarUrl: profile.avatar_url ?? "",
        },
      });
    },
    [router],
  );

  const filteredInbox = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return inbox;
    return inbox.filter((c) => {
      const name = (c.other_full_name || "").toLowerCase();
      const username = (c.other_username || "").toLowerCase();
      const last = (c.last_message_content || "").toLowerCase();
      return name.includes(q) || username.includes(q) || last.includes(q);
    });
  }, [inbox, search]);

  if (loading || authLoading) {
    return (
      <ScreenWrapper scrollable={false}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Search
            size={iw(16)}
            color={Colors.muted}
            style={styles.searchIcon}
            strokeWidth={1.75}
          />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search Chats..."
            placeholderTextColor={Colors.muted}
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>

        <Pressable
          onPress={() => setNewMsgOpen(true)}
          style={({ pressed }) => [
            styles.addBtn,
            pressed && styles.addBtnPressed,
          ]}
          hitSlop={8}
        >
          <Plus size={iw(16)} color={Colors.black} strokeWidth={1.75} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {filteredInbox.map((convo) => (
          <ConversationRow
            key={convo.conversation_id}
            convo={convo}
            onPress={() => openChat(convo)}
          />
        ))}

        {filteredInbox.length === 0 && (
          <View style={styles.emptyEnd}>
            <MessageCircle
              size={iw(40)}
              color={Colors.border}
              strokeWidth={1.75}
            />
            <Text style={styles.emptyTxt}>
              {search.trim()
                ? "No conversations match your search"
                : "No conversations yet"}
            </Text>
            {!search.trim() && (
              <Pressable
                style={styles.newChatBtn}
                onPress={() => setNewMsgOpen(true)}
              >
                <Text style={styles.newChatBtnTxt}>Start a conversation</Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>

      <NewMessageModal
        visible={newMsgOpen}
        onClose={() => setNewMsgOpen(false)}
        onConversationReady={handleConversationReady}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Layout.horizontal.sm,
    paddingHorizontal: Layout.horizontal.lg,
    paddingTop: Layout.vertical.sm,
    paddingBottom: Layout.vertical.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: Layout.vertical["2xl"],
    borderRadius: 999,
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: Layout.horizontal.sm,
  },
  searchIcon: {
    marginRight: Layout.horizontal.xs,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xs,
    color: Colors.black,
    padding: 0,
  },
  addBtn: {
    width: iw(35),
    height: iw(35),
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnPressed: {
    backgroundColor: Colors.surfaceSubtle,
  },
  emptyEnd: {
    alignItems: "center",
    paddingVertical: Layout.vertical["5xl"],
    gap: Layout.vertical.sm,
  },
  emptyTxt: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
  },
  newChatBtn: {
    marginTop: Layout.vertical.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Layout.horizontal.lg,
    paddingVertical: Layout.vertical.sm,
    borderRadius: 20,
  },
  newChatBtnTxt: {
    fontFamily: Typography.fonts.dm.semibold,
    fontSize: Typography.sizes.xs,
    color: Colors.white,
  },
});
