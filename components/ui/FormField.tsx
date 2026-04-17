import React, { useRef, useState } from "react";
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
import { Colors } from "@/constants/colors";
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
          placeholderTextColor={Colors.muted}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={onSubmitEditing}
          cursorColor={Colors.black}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Layout.vertical.lg,
  },
  label: {
    fontFamily: Typography.fonts.dm.semibold,
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
    letterSpacing: -0.5,
    marginBottom: Layout.vertical.xs,
  },
  inputRowBox: {
    height: Layout.horizontal["2xl"],
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: Layout.horizontal.sm,
    justifyContent: "center",
  },
  inputRowBoxFocused: {
    borderColor: Colors.divider,
    backgroundColor: Colors.white,
  },
  inputRowUnderline: {
    height: Layout.horizontal["2xl"],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    justifyContent: "center",
  },
  input: {
    flex: 1,
    fontFamily: Typography.fonts.dm.medium,
    fontSize: Typography.sizes.sm,
    letterSpacing: -0.5,
    color: Colors.black,
    paddingVertical: 0,
  },
});
