import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { Layout } from "@/constants/layout";
import { iw } from "@/shared/utils/responsive";
import { PickerModal } from "@/components/common/PickerModal";

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

export const MONTH_INDEX: Record<string, number> = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

type DropdownType = "day" | "month" | "year" | null;

export interface DateOfBirth {
  day: string;
  month: string;
  year: string;
}

interface DateOfBirthPickerProps {
  value: DateOfBirth;
  onChange: (dob: DateOfBirth) => void;
}

export function DateOfBirthPicker({ value, onChange }: DateOfBirthPickerProps) {
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);

  const { day, month, year } = value;

  const dropdownConfig: Record<
    NonNullable<DropdownType>,
    { title: string; data: string[]; selected: string }
  > = {
    day: { title: "Select Day", data: DAYS, selected: day },
    month: { title: "Select Month", data: MONTHS, selected: month },
    year: { title: "Select Year", data: YEARS, selected: year },
  };

  const handleSelect = (val: string) => {
    if (!activeDropdown) return;
    onChange({
      ...value,
      [activeDropdown]: val,
    });
    setActiveDropdown(null);
  };

  const DropdownTrigger = ({
    field,
    flex,
  }: {
    field: NonNullable<DropdownType>;
    flex?: number;
  }) => {
    const fieldValue = value[field];
    return (
      <Pressable
        style={[styles.dropdown, flex ? { flex } : undefined]}
        onPress={() => setActiveDropdown(field)}
      >
        <Text
          style={fieldValue ? styles.dropdownTxt : styles.dropdownPlaceholder}
        >
          {fieldValue || field.charAt(0).toUpperCase() + field.slice(1)}
        </Text>
        <Ionicons name="chevron-down" size={iw(16)} color={Colors.muted} />
      </Pressable>
    );
  };

  const active = activeDropdown ? dropdownConfig[activeDropdown] : null;

  return (
    <>
      <Text style={styles.label}>Date of Birth</Text>
      <View style={styles.row}>
        <DropdownTrigger field="day" flex={1} />
        <DropdownTrigger field="month" flex={1.4} />
        <DropdownTrigger field="year" flex={1} />
      </View>

      {active && (
        <PickerModal
          visible={activeDropdown !== null}
          title={active.title}
          data={active.data}
          selectedValue={active.selected}
          onSelect={handleSelect}
          onClose={() => setActiveDropdown(null)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: Typography.fonts.dm.medium,
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
    marginBottom: Layout.vertical.xs,
  },
  row: {
    flexDirection: "row",
    gap: Layout.horizontal.sm,
  },
  dropdown: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: Layout.horizontal["2xl"],
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: Layout.horizontal.sm,
    backgroundColor: Colors.white,
  },
  dropdownTxt: {
    fontFamily: Typography.fonts.dm.medium,
    fontSize: Typography.sizes.xs,
    color: Colors.black,
  },
  dropdownPlaceholder: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.black,
  },
});
