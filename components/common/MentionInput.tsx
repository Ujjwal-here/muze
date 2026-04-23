import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  TextInputProps,
  NativeSyntheticEvent,
  TextInputSelectionChangeEventData,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useTheme } from "@/context/theme";
import type { ThemeColors } from "@/constants/theme";
import { Typography } from "@/constants/typography";
import { iw } from "@/shared/utils/responsive";
import { searchProfiles } from "@/shared/services/chat";
import type { Profile } from "@/shared/types/chat";
import { Layout } from "@/constants/layout";

function detectMentionAtCaret(
  text: string,
  caret: number,
): { query: string; start: number; end: number } | null {
  if (caret <= 0 || caret > text.length) return null;

  let i = caret - 1;
  while (i >= 0) {
    const ch = text[i];
    if (ch === "@") {
      if (i === 0 || /\s/.test(text[i - 1])) {
        const query = text.slice(i + 1, caret);

        if (/^[A-Za-z0-9_.]*$/.test(query)) {
          return { query, start: i, end: caret };
        }
      }
      return null;
    }
    if (/\s/.test(ch)) return null;
    i--;
  }
  return null;
}

export interface MentionInputHandle {
  focus: () => void;
  blur: () => void;
}

interface MentionInputProps extends Omit<
  TextInputProps,
  "onChangeText" | "value" | "onSelectionChange"
> {
  value: string;
  onChangeText: (text: string) => void;

  suggestionAnchor?: "above" | "below";

  suggestionMaxHeight?: number;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export const MentionInput = forwardRef<MentionInputHandle, MentionInputProps>(
  function MentionInput(
    {
      value,
      onChangeText,
      suggestionAnchor = "above",
      suggestionMaxHeight,
      containerStyle,
      inputStyle,
      ...textInputProps
    },
    ref,
  ) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const inputRef = useRef<TextInput>(null);
    const [selection, setSelection] = useState({ start: 0, end: 0 });
    const [suggestions, setSuggestions] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
    }));

    const mention = useMemo(
      () => detectMentionAtCaret(value, selection.start),
      [value, selection.start],
    );

    const runSearch = useCallback((q: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (q.length === 0) {
        setSuggestions([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const profiles = await searchProfiles(q);
          setSuggestions(profiles);
        } catch {
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      }, 180);
    }, []);

    useEffect(() => {
      if (mention) {
        runSearch(mention.query);
      } else {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        setSuggestions([]);
        setLoading(false);
      }
    }, [mention, runSearch]);

    const handleSelectionChange = (
      e: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
    ) => {
      setSelection(e.nativeEvent.selection);
    };

    const applyMention = (profile: Profile) => {
      if (!mention) return;
      const before = value.slice(0, mention.start);
      const after = value.slice(mention.end);

      const inserted = `@${profile.username} `;
      const next = before + inserted + after;
      onChangeText(next);
      const newCaret = mention.start + inserted.length;

      setSelection({ start: newCaret, end: newCaret });

      requestAnimationFrame(() => {
        inputRef.current?.setNativeProps({
          selection: { start: newCaret, end: newCaret },
        });
      });
    };

    const showSuggestions = !!mention && (loading || suggestions.length > 0);

    const Dropdown = showSuggestions ? (
      <View
        style={[
          styles.suggestionsBox,
          suggestionAnchor === "above"
            ? styles.suggestionsAbove
            : styles.suggestionsBelow,
        ]}
      >
        {loading && suggestions.length === 0 ? (
          <View style={styles.suggestionLoading}>
            <ActivityIndicator size="small" color={colors.muted} />
          </View>
        ) : (
          <ScrollView
            style={{
              maxHeight: suggestionMaxHeight ?? Layout.vertical["22xl"],
            }}
            keyboardShouldPersistTaps="handled"
          >
            {suggestions.map((profile) => (
              <Pressable
                key={profile.id}
                style={({ pressed }) => [
                  styles.suggestionRow,
                  pressed && styles.suggestionRowPressed,
                ]}
                onPress={() => applyMention(profile)}
              >
                {profile.avatar_url ? (
                  <Image
                    source={{ uri: profile.avatar_url }}
                    style={styles.suggestionAvatar}
                  />
                ) : (
                  <View
                    style={[
                      styles.suggestionAvatar,
                      styles.suggestionAvatarFallback,
                    ]}
                  >
                    <Text style={styles.suggestionAvatarInitial}>
                      {(profile.full_name || profile.username)
                        .charAt(0)
                        .toUpperCase()}
                    </Text>
                  </View>
                )}
                <Text style={styles.suggestionUsername} numberOfLines={1}>
                  @{profile.username}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    ) : null;

    return (
      <View style={[styles.container, containerStyle]}>
        {suggestionAnchor === "above" && Dropdown}
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          onSelectionChange={handleSelectionChange}
          style={inputStyle}
          {...textInputProps}
        />
        {suggestionAnchor === "below" && Dropdown}
      </View>
    );
  },
);

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    position: "relative",
  },
  suggestionsBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    paddingVertical: Layout.vertical.sm,
    paddingHorizontal: Layout.horizontal.sm,
  },
  suggestionsAbove: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: "100%",
    marginBottom: Layout.vertical.sm,
    zIndex: 50,
  },
  suggestionsBelow: {
    marginTop: Layout.vertical.sm,
    zIndex: 50,
  },
  suggestionLoading: {
    paddingVertical: Layout.vertical.sm,
    alignItems: "center",
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Layout.vertical.sm,
    gap: Layout.horizontal.xs,
  },
  suggestionRowPressed: {
    opacity: 0.6,
  },
  suggestionAvatar: {
    width: iw(28),
    height: iw(28),
    borderRadius: 999,
    backgroundColor: colors.border,
  },
  suggestionAvatarFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.avatarFallback,
  },
  suggestionAvatarInitial: {
    fontFamily: Typography.fonts.dm.semibold,
    fontSize: Typography.sizes.xs,
    color: colors.label,
  },
  suggestionUsername: {
    flex: 1,
    minWidth: 0,
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xs,
    color: colors.black,
  },
});
