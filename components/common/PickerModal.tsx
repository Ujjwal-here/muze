import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
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
              <Ionicons name="close" size={iw(20)} color={Colors.muted} />
            </Pressable>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.item,
                  selectedValue === item && styles.itemSelected,
                ]}
                onPress={() => onSelect(item)}
              >
                <Text
                  style={[
                    styles.itemText,
                    selectedValue === item && styles.itemTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            )}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.white,
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
    borderBottomColor: Colors.border,
  },
  title: {
    fontFamily: Typography.fonts.semibold,
    fontSize: Typography.sizes.base,
    color: Colors.black,
  },
  item: {
    paddingVertical: Layout.vertical.md,
    paddingHorizontal: Layout.horizontal.lg,
  },
  itemSelected: {
    backgroundColor: Colors.inputBg,
  },
  itemText: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.label,
  },
  itemTextSelected: {
    fontFamily: Typography.fonts.semibold,
    color: Colors.primary,
  },
});
