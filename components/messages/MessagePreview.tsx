import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image as ImageIcon, Link2 } from "lucide-react-native";
import { useTheme } from "@/context/theme";
import type { ThemeColors } from "@/constants/theme";
import { Typography } from "@/constants/typography";
import { iw } from "@/shared/utils/responsive";
import type { InboxItem } from "@/shared/types/chat";
import { Layout } from "@/constants/layout";

type Props = {
  convo: InboxItem;
  unread: boolean;
};

export function MessagePreview({ convo, unread }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const type = convo.last_message_type;
  const meta = convo.last_message_metadata;
  const textStyle = [styles.text, unread && styles.textUnread];

  if (!convo.last_message_at) {
    return (
      <Text style={textStyle} numberOfLines={1}>
        Start a conversation
      </Text>
    );
  }

  if (type === "image") {
    const url: string | undefined = meta?.url;
    const isGif =
      meta?.is_gif === true ||
      (typeof url === "string" && /\.gif($|\?)/i.test(url));
    return (
      <View style={styles.row}>
        <ImageIcon
          size={iw(14)}
          color={unread ? colors.black : colors.muted}
          strokeWidth={1.75}
        />
        <Text style={textStyle} numberOfLines={1}>
          {isGif ? "GIF" : "Photo"}
        </Text>
      </View>
    );
  }

  if (type === "link_preview") {
    return (
      <View style={styles.row}>
        <Link2
          size={iw(14)}
          color={unread ? colors.black : colors.muted}
          strokeWidth={1.75}
        />
        <Text style={textStyle} numberOfLines={1}>
          {convo.last_message_content || "Link"}
        </Text>
      </View>
    );
  }

  return (
    <Text style={textStyle} numberOfLines={1}>
      {convo.last_message_content ?? "Start a conversation"}
    </Text>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: Layout.horizontal.xs,
    },
    text: {
      fontFamily: Typography.fonts.dm.regular,
      fontSize: Typography.sizes.xs,
      color: colors.muted,
    },
    textUnread: {
      color: colors.black,
      fontFamily: Typography.fonts.dm.semibold,
    },
  });
