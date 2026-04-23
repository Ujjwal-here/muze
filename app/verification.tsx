import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, Animated, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Layout } from "@/constants/layout";
import { Typography } from "@/constants/typography";
import { useTheme } from "@/context/theme";
import type { ThemeColors } from "@/constants/theme";
import { supabase } from "@/shared/lib/supabase";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { OtpCodeInput } from "@/components/auth/OtpCodeInput";
import { useFadeSlideAnims } from "@/hooks/useFadeSlideAnims";
import { toast } from "sonner-native";

const CODE_LENGTH = 6;

export default function VerificationScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);

  const { anims, animStyle } = useFadeSlideAnims(3);
  const [titleAnim, subtitleAnim, codeAnim] = anims;

  const handleContinue = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== CODE_LENGTH) return;

    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email ?? "",
      token: fullCode,
      type: "email",
    });

    if (error) {
      setLoading(false);
      toast.error(error.message, {
        description: "Please check the code and try again.",
      });
      setCode(Array(CODE_LENGTH).fill(""));
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    setLoading(false);

    const isNewUser = !userData.user?.user_metadata?.full_name;
    router.replace(isNewUser ? "/onboarding" : "/(tabs)/home");
  };

  const isComplete = code.every((digit) => digit !== "");

  return (
    <ScreenWrapper>
      <View style={styles.inner}>
        <View style={styles.content}>
          <Animated.Text style={[styles.title, animStyle(titleAnim)]}>
            Enter Verification Code
          </Animated.Text>

          <Animated.View style={[styles.subtitleWrap, animStyle(subtitleAnim)]}>
            <Text style={styles.subtitle}>
              We've sent a 6-digit code to your email address to
            </Text>
            <View style={styles.emailRow}>
              <Text style={styles.emailTxt}>{email || "your@email.com"}</Text>
              <Pressable onPress={() => router.back()}>
                <Text style={styles.changeTxt}>Change incorrect email</Text>
              </Pressable>
            </View>
          </Animated.View>

          <Animated.View style={animStyle(codeAnim)}>
            <OtpCodeInput value={code} onChange={setCode} />
          </Animated.View>
        </View>

        <View style={styles.btnWrap}>
          <PrimaryButton
            label="Continue"
            onPress={handleContinue}
            loading={loading}
            loadingLabel="Verifying..."
            disabled={!isComplete}
          />
        </View>
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
  subtitleWrap: {
    alignItems: "center",
    marginBottom: Layout.vertical["3xl"],
  },
  subtitle: {
    fontFamily: Typography.fonts.dm.regular,
    fontSize: Typography.sizes.xs,
    color: colors.subtitle,
    textAlign: "center",
    lineHeight: Typography.sizes.xs * 1.6,
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Layout.horizontal.xs,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  emailTxt: {
    fontFamily: Typography.fonts.dm.medium,
    fontSize: Typography.sizes.xs,
    color: colors.black,
  },
  changeTxt: {
    fontFamily: Typography.fonts.dm.medium,
    fontSize: Typography.sizes.xs,
    color: colors.primary,
    textDecorationLine: "underline",
  },
  btnWrap: {
    paddingHorizontal: Layout.horizontal.lg,
    paddingBottom: Layout.vertical["3xl"],
  },
});
