import React from "react";
import { Text, StyleProp, TextStyle } from "react-native";
import { router } from "expo-router";
import { parseMentions } from "@/shared/utils/mentions";

interface MentionTextProps {
  text: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  onMentionPress?: (username: string) => void;
  mentionStyle?: StyleProp<TextStyle>;
}

export function MentionText({
  text,
  style,
  numberOfLines,
  onMentionPress,
  mentionStyle,
}: MentionTextProps) {
  const segments = parseMentions(text);

  const handlePress = (username: string) => {
    if (onMentionPress) {
      onMentionPress(username);
      return;
    }
    try {
      router.push(`/profile/${username}` as any);
    } catch {}
  };

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {segments.map((seg, i) => {
        if (seg.type === "mention") {
          return (
            <Text
              key={i}
              style={mentionStyle}
              onPress={() => handlePress(seg.value)}
              suppressHighlighting
            >
              {seg.raw}
            </Text>
          );
        }
        return <Text key={i}>{seg.value}</Text>;
      })}
    </Text>
  );
}
