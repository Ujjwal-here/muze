import React, { useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardTypeOptions,
  StyleProp,
  ViewStyle,
  TextInputProps,
} from "react-native";
import { useTheme } from "@/context/theme";
import type { ThemeColors } from "@/constants/theme";
import { Typography } from "@/constants/typography";
import { Layout } from "@/constants/layout";

interface FormFieldProps extends Pick<
  TextInputProps,
  "autoCapitalize" | "autoCorrect" | "onSubmitEditing"
> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  style?: StyleProp<ViewStyle>;
  variant?: "box" | "underline";
}

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "none",
  autoCorrect = false,
  onSubmitEditing,
  style,
  variant = "box",
}: FormFieldProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  const isBox = variant === "box";

  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[
          isBox ? styles.inputRowBox : styles.inputRowUnderline,
          isBox && focused && styles.inputRowBoxFocused,
        ]}
        onPress={() => inputRef.current?.focus()}
      >
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={onSubmitEditing}
          cursorColor={colors.black}
        />
      </Pressable>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  wrap: {
    marginBottom: Layout.vertical.lg,
  },
  label: {
    fontFamily: Typography.fonts.dm.semibold,
    fontSize: Typography.sizes.xs,
    color: colors.muted,
    letterSpacing: -0.5,
    marginBottom: Layout.vertical.xs,
  },
  inputRowBox: {
    height: Layout.horizontal["2xl"],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: Layout.horizontal.sm,
    justifyContent: "center",
  },
  inputRowBoxFocused: {
    borderColor: colors.divider,
    backgroundColor: colors.white,
  },
  inputRowUnderline: {
    height: Layout.horizontal["2xl"],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    justifyContent: "center",
  },
  input: {
    flex: 1,
    fontFamily: Typography.fonts.dm.medium,
    fontSize: Typography.sizes.sm,
    letterSpacing: -0.5,
    color: colors.black,
    paddingVertical: 0,
  },
});
