import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Layout } from "@/constants/layout";
import { iw } from "@/shared/utils/responsive";
import { Typography } from "@/constants/typography";
import { Colors } from "@/constants/colors";
import { supabase } from "@/shared/lib/supabase";

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

const MONTH_INDEX: Record<string, number> = {
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

export default function OnboardingScreen() {
  const [fullName, setFullName] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  const [loading, setLoading] = useState(false);
  const nameRef = useRef<TextInput>(null);

  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const nameAnim = useRef(new Animated.Value(0)).current;
  const dobAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;

  const fadeSlide = (anim: Animated.Value, delay: number) =>
    Animated.timing(anim, {
      toValue: 1,
      duration: 480,
      delay,
      useNativeDriver: true,
    });

  useEffect(() => {
    Animated.stagger(80, [
      fadeSlide(titleAnim, 0),
      fadeSlide(subtitleAnim, 0),
      fadeSlide(nameAnim, 0),
      fadeSlide(dobAnim, 0),
      fadeSlide(btnAnim, 0),
    ]).start();
  }, []);

  const animStyle = (anim: Animated.Value, offsetY = 16) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [offsetY, 0],
        }),
      },
    ],
  });

  // ─── Age gate ─────────────────────────────────────────────────────────────
  const isAgeValid = (): boolean => {
    if (!day || !month || !year) return false;
    const dob = new Date(parseInt(year), MONTH_INDEX[month] - 1, parseInt(day));
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const hasBirthdayPassed =
      today.getMonth() > dob.getMonth() ||
      (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
    return age > 13 || (age === 13 && hasBirthdayPassed);
  };

  const isComplete =
    fullName.trim() !== "" && day !== "" && month !== "" && year !== "";

  // ─── Save profile ─────────────────────────────────────────────────────────
  const handleContinue = async () => {
    if (!isComplete) return;

    if (!isAgeValid()) {
      Alert.alert(
        "Age Requirement",
        "You must be at least 13 years old to use Muze.",
      );
      return;
    }

    setLoading(true);
    const dob = `${year}-${String(MONTH_INDEX[month]).padStart(2, "0")}-${String(parseInt(day)).padStart(2, "0")}`;

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName.trim(),
        date_of_birth: dob,
        onboarding_complete: true,
      },
    });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    // Done — go to home screen
    router.replace("/home");
  };

  const getDropdownData = () => {
    if (activeDropdown === "day") return DAYS;
    if (activeDropdown === "month") return MONTHS;
    if (activeDropdown === "year") return YEARS;
    return [];
  };

  const getDropdownTitle = () => {
    if (activeDropdown === "day") return "Select Day";
    if (activeDropdown === "month") return "Select Month";
    if (activeDropdown === "year") return "Select Year";
    return "";
  };

  const handleDropdownSelect = (value: string) => {
    if (activeDropdown === "day") setDay(value);
    if (activeDropdown === "month") setMonth(value);
    if (activeDropdown === "year") setYear(value);
    setActiveDropdown(null);
  };

  const getSelectedValue = () => {
    if (activeDropdown === "day") return day;
    if (activeDropdown === "month") return month;
    if (activeDropdown === "year") return year;
    return "";
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" />

      <View style={styles.inner}>
        <View style={styles.content}>
          <Animated.Text style={[styles.title, animStyle(titleAnim)]}>
            Create Your Profile
          </Animated.Text>

          <Animated.Text style={[styles.subtitle, animStyle(subtitleAnim)]}>
            You need to be at least 13 to create a profile on Muze. Your
            birthday will stay private and won't be shown publicly.
          </Animated.Text>

          <Animated.View style={[styles.fieldWrap, animStyle(nameAnim)]}>
            <Text style={styles.label}>Full Name</Text>
            <Pressable
              style={styles.inputRow}
              onPress={() => nameRef.current?.focus()}
            >
              <TextInput
                ref={nameRef}
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={Colors.placeholder}
                autoCapitalize="words"
                autoCorrect={false}
                value={fullName}
                onChangeText={setFullName}
              />
            </Pressable>
          </Animated.View>

          <Animated.View style={[styles.fieldWrap, animStyle(dobAnim)]}>
            <Text style={styles.label}>Date of Birth</Text>
            <View style={styles.dobRow}>
              <Pressable
                style={styles.dropdown}
                onPress={() => setActiveDropdown("day")}
              >
                <Text
                  style={day ? styles.dropdownTxt : styles.dropdownPlaceholder}
                >
                  {day || "Day"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={iw(16)}
                  color={Colors.muted}
                />
              </Pressable>

              <Pressable
                style={[styles.dropdown, styles.dropdownMonth]}
                onPress={() => setActiveDropdown("month")}
              >
                <Text
                  style={
                    month ? styles.dropdownTxt : styles.dropdownPlaceholder
                  }
                >
                  {month || "Month"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={iw(16)}
                  color={Colors.muted}
                />
              </Pressable>

              <Pressable
                style={styles.dropdown}
                onPress={() => setActiveDropdown("year")}
              >
                <Text
                  style={year ? styles.dropdownTxt : styles.dropdownPlaceholder}
                >
                  {year || "Year"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={iw(16)}
                  color={Colors.muted}
                />
              </Pressable>
            </View>
          </Animated.View>
        </View>

        <Animated.View style={[styles.btnWrap, animStyle(btnAnim)]}>
          <Pressable
            style={({ pressed }) => [
              styles.continueBtn,
              !isComplete && styles.continueBtnDisabled,
              pressed &&
                isComplete && { backgroundColor: Colors.primaryPressed },
            ]}
            onPress={handleContinue}
            disabled={!isComplete || loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.continueTxt}>Continue</Text>
            )}
          </Pressable>
        </Animated.View>
      </View>

      <Modal
        visible={activeDropdown !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveDropdown(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setActiveDropdown(null)}
        >
          <Pressable style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{getDropdownTitle()}</Text>
              <Pressable onPress={() => setActiveDropdown(null)}>
                <Ionicons name="close" size={iw(20)} color={Colors.muted} />
              </Pressable>
            </View>
            <FlatList
              data={getDropdownData()}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.modalItem,
                    getSelectedValue() === item && styles.modalItemSelected,
                  ]}
                  onPress={() => handleDropdownSelect(item)}
                >
                  <Text
                    style={[
                      styles.modalItemTxt,
                      getSelectedValue() === item &&
                        styles.modalItemTxtSelected,
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  inner: { flex: 1, justifyContent: "space-between" },
  content: {
    paddingHorizontal: Layout.horizontal.lg,
    paddingTop: Layout.vertical["7xl"],
  },
  title: {
    fontFamily: Typography.fonts.bold,
    fontSize: Typography.sizes.xl,
    color: Colors.black,
    textAlign: "center",
    marginBottom: Layout.vertical.md,
  },
  subtitle: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.xs,
    color: Colors.subtitle,
    textAlign: "center",
    lineHeight: Typography.sizes.xs * 1.6,
    marginBottom: Layout.vertical["3xl"],
    paddingHorizontal: Layout.horizontal.sm,
  },
  fieldWrap: { marginBottom: Layout.vertical.xl },
  label: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.xs,
    color: Colors.label,
    marginBottom: Layout.vertical.xs,
  },
  inputRow: {
    height: Layout.horizontal["2xl"],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    justifyContent: "center",
  },
  input: {
    flex: 1,
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.black,
    paddingVertical: 0,
  },
  dobRow: { flexDirection: "row", gap: Layout.horizontal.sm },
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
  dropdownMonth: { flex: 1.4 },
  dropdownTxt: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.sm,
    color: Colors.black,
  },
  dropdownPlaceholder: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.placeholder,
  },
  btnWrap: {
    paddingHorizontal: Layout.horizontal.lg,
    paddingBottom: Layout.vertical["3xl"],
  },
  continueBtn: {
    paddingVertical: Layout.vertical.smMd,
    backgroundColor: Colors.primary,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  continueBtnDisabled: { opacity: 0.5 },
  continueTxt: {
    fontFamily: Typography.fonts.semibold,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    letterSpacing: 0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "50%",
    paddingBottom: Layout.vertical["2xl"],
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Layout.horizontal.lg,
    paddingVertical: Layout.vertical.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontFamily: Typography.fonts.semibold,
    fontSize: Typography.sizes.base,
    color: Colors.black,
  },
  modalItem: {
    paddingVertical: Layout.vertical.md,
    paddingHorizontal: Layout.horizontal.lg,
  },
  modalItemSelected: { backgroundColor: Colors.inputBg },
  modalItemTxt: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.label,
  },
  modalItemTxtSelected: {
    fontFamily: Typography.fonts.semibold,
    color: Colors.primary,
  },
});
