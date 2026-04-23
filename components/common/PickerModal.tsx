import React, { useMemo } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/theme";
import type { ThemeColors } from "@/constants/theme";
import { Typography } from "@/constants/typography";
import { Layout } from "@/constants/layout";
import { iw } from "@/shared/utils/responsive";

interface PickerModalProps {
  visible: boolean;
  title: string;
  data: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export function PickerModal({
  visible,
  title,
  data,
  selectedValue,
  onSelect,
  onClose,
}: PickerModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={iw(20)} color={colors.muted} />
            </Pressable>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const selected = selectedValue === item;
              return (
                <Pressable
                  style={[styles.item, selected && styles.itemSelected]}
                  onPress={() => onSelect(item)}
                >
                  <Text
                    style={[styles.itemText, selected && styles.itemTextSelected]}
                  >
                    {item}
                  </Text>
                  {selected && (
                    <Ionicons
                      name="checkmark"
                      size={iw(18)}
                      color={colors.primary}
                    />
                  )}
                </Pressable>
              );
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlayModalDark,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "50%",
    paddingBottom: Layout.vertical["2xl"],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Layout.horizontal.lg,
    paddingVertical: Layout.vertical.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontFamily: Typography.fonts.dm.semibold,
    fontSize: Typography.sizes.base,
    color: colors.black,
  },
  item: {
    paddingVertical: Layout.vertical.md,
    paddingHorizontal: Layout.horizontal.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemSelected: {
    backgroundColor: colors.inputBg,
  },
  itemText: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.sm,
    color: colors.label,
  },
  itemTextSelected: {
    fontFamily: Typography.fonts.dm.semibold,
    color: colors.black,
  },
});
