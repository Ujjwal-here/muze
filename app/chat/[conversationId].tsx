import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { toast } from "sonner-native";
import { Layout } from "@/constants/layout";
import { ih } from "@/shared/utils/responsive";
import { useTheme } from "@/context/theme";
import type { ThemeColors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { supabase } from "@/shared/lib/supabase";
import {
  fetchMessages,
  sendMessage,
  subscribeToMessages,
  markAsRead,
} from "@/shared/services/chat";
import { uploadToBucket } from "@/shared/services/upload";
import type { Message, ReplySnapshot } from "@/shared/types/chat";
import {
  reconcile,
  shouldShowDateSeparator,
  isGroupedWithPrev,
} from "@/shared/utils/chat";
import { useImagePicker } from "@/hooks/useImagePicker";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import {
  ChatHeader,
  ChatComposer,
  ChatEmpty,
  MessageRow,
  type PendingImage,
} from "@/components/chat";

const PAGE_SIZE = 50;

export default function ChatScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{
    conversationId: string;
    otherUserId: string;
    otherUsername: string;
    otherFullName: string;
    otherAvatarUrl: string;
  }>();

  const { conversationId, otherUsername = "", otherFullName = "" } = params;

  const displayName = otherFullName || otherUsername || "Chat";
  const avatarInitial = displayName.charAt(0).toUpperCase();

  const [messages, setMessages] = useState<Message[]>([]);
  const [myUsername, setMyUsername] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [replyingTo, setReplyingTo] = useState<ReplySnapshot | null>(null);
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);

  const isKeyboardOpen = useKeyboardVisible();
  const pickImage = useImagePicker();

  const flatListRef = useRef<FlatList>(null);

  const loadMessages = useCallback(async () => {
    if (!conversationId || !user) return;
    try {
      const msgs = await fetchMessages(conversationId);
      setMessages(msgs);
      if (msgs.length < PAGE_SIZE) setHasMore(false);
      markAsRead(conversationId, user.id).catch(() => {});
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoading(false);
    }
  }, [conversationId, user]);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.username) setMyUsername(data.username);
      });
  }, [user?.id]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = subscribeToMessages(conversationId, (newMsg) => {
      setMessages((prev) => reconcile(prev, newMsg));
      if (user && conversationId) {
        markAsRead(conversationId, user.id).catch(() => {});
      }
    });

    return unsubscribe;
  }, [conversationId, user]);

  const loadOlderMessages = useCallback(async () => {
    if (!conversationId || !hasMore || loadingMore || messages.length === 0)
      return;

    setLoadingMore(true);
    try {
      const oldest = messages[0].created_at;
      const olderMsgs = await fetchMessages(conversationId, PAGE_SIZE, oldest);
      if (olderMsgs.length < PAGE_SIZE) setHasMore(false);
      if (olderMsgs.length > 0) {
        setMessages((prev) => [...olderMsgs, ...prev]);
      }
    } catch (err) {
      console.error("Failed to load older messages:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [conversationId, hasMore, loadingMore, messages]);

  const makeOptimistic = useCallback(
    (
      content: string | null,
      type: Message["message_type"],
      metadata: Record<string, any>,
    ): Message => ({
      id: `temp-${Date.now()}`,
      conversation_id: conversationId!,
      sender_id: user!.id,
      content,
      message_type: type,
      metadata,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
    [conversationId, user],
  );

  const replaceOptimistic = useCallback((tempId: string, sentMsg: Message) => {
    setMessages((prev) => {
      const hasReal = prev.some((m) => m.id === sentMsg.id);
      if (hasReal) return prev.filter((m) => m.id !== tempId);
      return prev.map((m) => (m.id === tempId ? sentMsg : m));
    });
  }, []);

  const handleSend = useCallback(async () => {
    if (!conversationId || sending) return;
    const text = inputText.trim();
    const hasImage = !!pendingImage;
    if (!text && !hasImage) return;

    setSending(true);
    setInputText("");
    const replyForThisSend = replyingTo;
    setReplyingTo(null);
    const imageForThisSend = pendingImage;
    setPendingImage(null);

    const metadata: Record<string, any> = {};
    if (replyForThisSend) metadata.reply_to = replyForThisSend;

    if (imageForThisSend) {
      const optimisticMsg = makeOptimistic(text || null, "image", {
        ...metadata,
        url: imageForThisSend.uri,
        uploading: true,
      });
      setMessages((prev) => [...prev, optimisticMsg]);

      try {
        const publicUrl = await uploadToBucket(imageForThisSend.uri, user!.id, {
          subpath: "chat",
          mimeType: imageForThisSend.mimeType,
        });
        const sentMsg = await sendMessage(conversationId, text, "image", {
          ...metadata,
          url: publicUrl,
        });
        replaceOptimistic(optimisticMsg.id, sentMsg);
      } catch (err: any) {
        toast.error(err?.message || "Failed to send image");
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
        setInputText(text);
        setPendingImage(imageForThisSend);
        setReplyingTo(replyForThisSend);
      } finally {
        setSending(false);
      }
      return;
    }

    const optimisticMsg = makeOptimistic(text, "text", metadata);
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const sentMsg = await sendMessage(conversationId, text, "text", metadata);
      replaceOptimistic(optimisticMsg.id, sentMsg);
    } catch (err: any) {
      toast.error(err?.message || "Failed to send message");
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      setInputText(text);
      setReplyingTo(replyForThisSend);
    } finally {
      setSending(false);
    }
  }, [
    inputText,
    conversationId,
    sending,
    user,
    replyingTo,
    pendingImage,
    makeOptimistic,
    replaceOptimistic,
  ]);

  const startReply = useCallback(
    (m: Message) => {
      const snap: ReplySnapshot = {
        id: m.id,
        sender_id: m.sender_id,
        sender_username:
          m.sender_id === user?.id ? myUsername : otherUsername || null,
        message_type: m.message_type,
        content: m.content,
        metadata:
          m.message_type === "image" && m.metadata?.url
            ? { url: m.metadata.url }
            : null,
      };
      setReplyingTo(snap);
    },
    [user, otherUsername, myUsername],
  );

  const handlePickImage = useCallback(async () => {
    if (sending) return;
    const picked = await pickImage();
    if (picked) setPendingImage({ uri: picked.uri, mimeType: picked.mimeType });
  }, [sending, pickImage]);

  const handlePickGif = useCallback(() => {
    toast.info("GIF picker coming soon");
  }, []);

  const handleBack = useCallback(async () => {
    if (user && conversationId) {
      try {
        await markAsRead(conversationId, user.id);
      } catch {}
    }
    router.back();
  }, [conversationId, user, router]);

  const lastSentByMeIndex = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender_id === user?.id) return i;
    }
    return -1;
  }, [messages, user?.id]);

  const renderMessage = useCallback(
    ({ item, index: reversedIndex }: { item: Message; index: number }) => {
      const index = messages.length - 1 - reversedIndex;
      const isMe = item.sender_id === user?.id;
      const showDate = shouldShowDateSeparator(messages, index);
      const showAvatar =
        !isMe &&
        (index === messages.length - 1 ||
          messages[index + 1]?.sender_id !== item.sender_id);
      const isGrouped = isGroupedWithPrev(messages, index, showDate);
      const showSenderBreak =
        !showDate &&
        index > 0 &&
        messages[index - 1].sender_id !== item.sender_id;
      const showDelivered =
        isMe && index === lastSentByMeIndex && !item.id.startsWith("temp-");
      const canReply = !item.id.startsWith("temp-");

      return (
        <MessageRow
          item={item}
          isMe={isMe}
          showDate={showDate}
          showAvatar={showAvatar}
          isGrouped={isGrouped}
          showSenderBreak={showSenderBreak}
          avatarInitial={avatarInitial}
          showDelivered={showDelivered}
          canReply={canReply}
          onReply={() => startReply(item)}
        />
      );
    },
    [user, messages, avatarInitial, lastSentByMeIndex, startReply],
  );

  if (loading) {
    return (
      <ScreenWrapper scrollable={false} style={styles.root}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scrollable={false} style={styles.root}>
      <ChatHeader
        username={otherUsername}
        avatarInitial={avatarInitial}
        onBack={handleBack}
      />

      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={
          isKeyboardOpen
            ? Platform.OS === "ios"
              ? "padding"
              : "height"
            : undefined
        }
        keyboardVerticalOffset={0}
      >
        <View style={styles.card}>
          <FlatList
            ref={flatListRef}
            inverted
            data={messages.slice().reverse()}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onEndReached={loadOlderMessages}
            onEndReachedThreshold={0.5}
            keyboardShouldPersistTaps="handled"
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={styles.loadingMore}
                />
              ) : null
            }
          />
          {messages.length === 0 && (
            <View style={styles.emptyOverlay} pointerEvents="box-none">
              <ChatEmpty
                avatarInitial={avatarInitial}
                displayName={displayName}
                username={otherUsername}
              />
            </View>
          )}

          <ChatComposer
            inputText={inputText}
            onChangeText={setInputText}
            pendingImage={pendingImage}
            replyingTo={replyingTo}
            sending={sending}
            bottomPadding={ih(8)}
            onSend={handleSend}
            onPickImage={handlePickImage}
            onPickGif={handlePickGif}
            onCancelImage={() => setPendingImage(null)}
            onCancelReply={() => setReplyingTo(null)}
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { backgroundColor: colors.surfaceMuted },
    card: {
      flex: 1,
      marginHorizontal: Layout.horizontal.sm,
      marginTop: Layout.vertical.sm,
      marginBottom: Layout.vertical.md,
      backgroundColor: colors.background,
      borderRadius: 12,
      overflow: "hidden",
    },
    flex1: {
      flex: 1,
    },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    messagesList: {
      paddingHorizontal: Layout.horizontal.md,
      paddingVertical: Layout.vertical.md,
    },
    loadingMore: {
      paddingVertical: Layout.vertical.md,
    },
    emptyOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
    },
  });
