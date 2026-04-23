import React, { useState, useMemo } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { router } from "expo-router";
import { Layout } from "@/constants/layout";
import { Typography } from "@/constants/typography";
import { useTheme } from "@/context/theme";
import type { ThemeColors } from "@/constants/theme";
import { supabase } from "@/shared/lib/supabase";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { FormField } from "@/components/ui/FormField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  DateOfBirthPicker,
  DateOfBirth,
  MONTH_INDEX,
} from "@/components/auth/DateOfBirthPicker";
import { useFadeSlideAnims } from "@/hooks/useFadeSlideAnims";
import { toast } from "sonner-native";

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState<DateOfBirth>({ day: "", month: "", year: "" });
  const [loading, setLoading] = useState(false);

  const { anims, animStyle } = useFadeSlideAnims(5);
  const [titleAnim, subtitleAnim, nameAnim, dobAnim, btnAnim] = anims;

  const isAgeValid = (): boolean => {
    const { day, month, year } = dob;
    if (!day || !month || !year) return false;
    const dobDate = new Date(
      parseInt(year),
      MONTH_INDEX[month] - 1,
      parseInt(day),
    );
    const today = new Date();
    const age = today.getFullYear() - dobDate.getFullYear();
    const hasBirthdayPassed =
      today.getMonth() > dobDate.getMonth() ||
      (today.getMonth() === dobDate.getMonth() &&
        today.getDate() >= dobDate.getDate());
    return age > 13 || (age === 13 && hasBirthdayPassed);
  };

  const isComplete =
    fullName.trim() !== "" &&
    dob.day !== "" &&
    dob.month !== "" &&
    dob.year !== "";

  const handleContinue = async () => {
    if (!isComplete) return;

    if (!isAgeValid()) {
      toast.warning("You must be at least 13 years old to use Muze.", {
        description: "Age Requirement",
      });
      return;
    }

    setLoading(true);
    const dobStr = `${dob.year}-${String(MONTH_INDEX[dob.month]).padStart(2, "0")}-${String(parseInt(dob.day)).padStart(2, "0")}`;

    try {
      // updateUser can hang on RN + AsyncStorage — race it against a timeout.
      const updatePromise = supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          date_of_birth: dobStr,
          onboarding_complete: true,
        },
      });

      const timeoutPromise = new Promise<{ error: Error }>((resolve) =>
        setTimeout(() => resolve({ error: new Error("timeout") }), 8000),
      );

      const { error } = await Promise.race([updatePromise, timeoutPromise]);

      if (error && error.message !== "timeout") {
        setLoading(false);
        toast.error(error.message);
        return;
      }
    } catch (e: any) {
      setLoading(false);
      toast.error(e?.message ?? "Something went wrong");
      return;
    }

    router.replace("/home");
  };

  return (
    <ScreenWrapper>
      <View style={styles.inner}>
        <View style={styles.content}>
          <Animated.Text style={[styles.title, animStyle(titleAnim)]}>
            Create Your Profile
          </Animated.Text>

          <Animated.Text style={[styles.subtitle, animStyle(subtitleAnim)]}>
            You need to be at least 13 to create a profile on Muze. Your
            birthday will stay private and won't be shown publicly.
          </Animated.Text>

          <Animated.View style={animStyle(nameAnim)}>
            <FormField
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              style={styles.nameField}
            />
          </Animated.View>

          <Animated.View style={[styles.dobWrap, animStyle(dobAnim)]}>
            <DateOfBirthPicker value={dob} onChange={setDob} />
          </Animated.View>
        </View>

        <Animated.View style={[styles.btnWrap, animStyle(btnAnim)]}>
          <PrimaryButton
            label="Continue"
            onPress={handleContinue}
            loading={loading}
            disabled={!isComplete}
            loadingLabel="Updating..."
          />
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  inner: {
    flex: 1,
    justifyContent: "space-between",
  },
  content: {
    paddingHorizontal: Layout.horizontal.lg,
    paddingTop: Layout.vertical["7xl"],
  },
  title: {
    fontFamily: Typography.fonts.cabin.bold,
    fontSize: Typography.sizes.lg,
    color: colors.black,
    textAlign: "center",
    marginBottom: Layout.vertical.md,
  },
  subtitle: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xs,
    color: colors.subtitle,
    textAlign: "center",
    lineHeight: Typography.sizes.xs * 1.6,
    marginBottom: Layout.vertical["3xl"],
    paddingHorizontal: Layout.horizontal.sm,
  },
  nameField: {
    marginBottom: Layout.vertical.xl,
  },
  dobWrap: {
    marginBottom: Layout.vertical.xl,
  },
  btnWrap: {
    paddingHorizontal: Layout.horizontal.lg,
    paddingBottom: Layout.vertical["3xl"],
  },
});
