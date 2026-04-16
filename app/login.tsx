import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Layout } from "@/constants/layout";
import { iw } from "@/shared/utils/responsive";
import { Typography } from "@/constants/typography";
import { Colors } from "@/constants/colors";
import { supabase } from "@/shared/lib/supabase";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { FormField } from "@/components/ui/FormField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useFadeSlideAnims } from "@/hooks/useFadeSlideAnims";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const { anims, animStyle } = useFadeSlideAnims(4);
  const [logoAnim, titleAnim, subtitleAnim, formAnim] = anims;

  const handleContinue = async () => {
    const trimmed = email.trim();
    if (!trimmed) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { shouldCreateUser: true },
    });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    router.push({ pathname: "/verification", params: { email: trimmed } });
  };

  return (
    <ScreenWrapper>
      <View style={styles.inner}>
        <Animated.View style={[styles.logoWrap, animStyle(logoAnim, 20)]}>
          <Image
            source={require("@/assets/images/muze-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.Text style={[styles.title, animStyle(titleAnim)]}>
          Muze, a new social network
        </Animated.Text>

        <Animated.Text style={[styles.subtitle, animStyle(subtitleAnim)]}>
          Be the vibe, break the mold.{"\n"}Make it big on Muze.
        </Animated.Text>

        <Animated.View style={animStyle(formAnim)}>
          <FormField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            onSubmitEditing={handleContinue}
            style={styles.field}
          />

          <PrimaryButton
            label="Continue"
            onPress={handleContinue}
            loading={loading}
            disabled={!email.trim()}
          />
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    paddingHorizontal: Layout.horizontal.lg,
    justifyContent: "center",
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: Layout.vertical.lg,
  },
  logo: {
    width: iw(70),
    height: iw(70),
  },
  title: {
    fontFamily: Typography.fonts.bold,
    fontSize: Typography.sizes.xl,
    color: Colors.black,
    textAlign: "center",
    marginBottom: Layout.vertical.sm,
  },
  subtitle: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.subtitle,
    textAlign: "center",
    lineHeight: Typography.sizes.sm * 1.6,
    marginBottom: Layout.vertical["3xl"],
  },
  field: {
    marginBottom: Layout.vertical.lg,
  },
});
