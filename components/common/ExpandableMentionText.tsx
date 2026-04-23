import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StyleProp,
  TextStyle,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/context/theme";
import type { ThemeColors } from "@/constants/theme";
import { Typography } from "@/constants/typography";
import { Layout } from "@/constants/layout";
import { parseMentions } from "@/shared/utils/mentions";
import { MentionText } from "./MentionText";

type Props = {
  text: string;
  collapsedLines?: number;
  style?: StyleProp<TextStyle>;
  mentionStyle?: StyleProp<TextStyle>;
};

export function ExpandableMentionText({
  text,
  collapsedLines = 4,
  style,
  mentionStyle,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [truncatedText, setTruncatedText] = useState("");

  const handleMentionPress = (u: string) => router.push(`/profile/${u}` as any);

  return (
    <View>
      <Text
        style={[style, styles.hiddenText]}
        onTextLayout={(e) => {
          const lines = e.nativeEvent.lines;
          if (lines.length > collapsedLines) {
            setIsTruncated(true);
            setTruncatedText(
              lines
                .slice(0, collapsedLines)
                .map((l) => l.text)
                .join("")
                .trimEnd(),
            );
          }
        }}
      >
        {text}
      </Text>

      {!expanded && isTruncated ? (
        <Text style={style}>
          {parseMentions(truncatedText).map((seg, i) =>
            seg.type === "mention" ? (
              <Text
                key={i}
                style={mentionStyle}
                onPress={(e) => {
                  e.stopPropagation();
                  handleMentionPress(seg.value);
                }}
                suppressHighlighting
              >
                {seg.raw}
              </Text>
            ) : (
              <Text key={i}>{seg.value}</Text>
            ),
          )}
          <Text
            style={styles.more}
            onPress={(e) => {
              e.stopPropagation();
              setExpanded(true);
            }}
          >
            {" "}
            ...more
          </Text>
        </Text>
      ) : (
        <MentionText
          text={text}
          style={style}
          onMentionPress={handleMentionPress}
          mentionStyle={mentionStyle}
        />
      )}

      {isTruncated && expanded && (
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            setExpanded(false);
          }}
        >
          <Text style={styles.toggle}>Show less</Text>
        </Pressable>
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  hiddenText: {
    position: "absolute",
    opacity: 0,
  },
  more: {
    fontFamily: Typography.fonts.dm.medium,
    fontSize: Typography.sizes.xs,
    color: colors.muted,
  },
  toggle: {
    fontFamily: Typography.fonts.dm.medium,
    fontSize: Typography.sizes.xs,
    color: colors.muted,
    marginBottom: Layout.vertical.xs,
  },
});
