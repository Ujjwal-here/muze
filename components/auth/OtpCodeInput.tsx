import React, { useRef, useEffect } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { Layout } from "@/constants/layout";
import { iw } from "@/shared/utils/responsive";

const CODE_LENGTH = 6;
const INPUT_SIZE = iw(42);

interface OtpCodeInputProps {
  value: string[];
  onChange: (code: string[]) => void;
  autoFocus?: boolean;
}

export function OtpCodeInput({
  value,
  onChange,
  autoFocus = true,
}: OtpCodeInputProps) {
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRefs.current[0]?.focus(), 500);
    }
  }, [autoFocus]);

  const handleChangeText = (text: string, index: number) => {
    // Handle paste
    if (text.length > 1) {
      const digits = text
        .replace(/[^0-9]/g, "")
        .split("")
        .slice(0, CODE_LENGTH);
      const newCode = [...value];
      digits.forEach((digit, i) => {
        if (index + i < CODE_LENGTH) newCode[index + i] = digit;
      });
      onChange(newCode);
      const nextIndex = Math.min(index + digits.length, CODE_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newCode = [...value];
    newCode[index] = text.replace(/[^0-9]/g, "");
    onChange(newCode);
    if (text && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !value[index] && index > 0) {
      const newCode = [...value];
      newCode[index - 1] = "";
      onChange(newCode);
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {value.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          style={[styles.cell, digit ? styles.cellFilled : null]}
          value={digit}
          onChangeText={(text) => handleChangeText(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
          autoComplete="one-time-code"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Layout.horizontal.sm,
    marginBottom: Layout.vertical.lg,
  },
  cell: {
    width: INPUT_SIZE,
    height: INPUT_SIZE,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.inputBg,
    textAlign: "center",
    fontFamily: Typography.fonts.semibold,
    fontSize: Typography.sizes.xl,
    color: Colors.black,
  },
  cellFilled: {
    borderColor: Colors.divider,
    backgroundColor: Colors.white,
  },
});
