import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Layout } from "@/constants/layout";
import { iw } from "@/shared/utils/responsive";
import { Typography } from "@/constants/typography";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/auth";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const fullName = user?.user_metadata?.full_name ?? "User";
  const email = user?.email ?? "";
  const initial = fullName.charAt(0).toUpperCase();
  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "";

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/splash");
        },
      },
    ]);
  };

  const MENU_ITEMS = [
    { icon: "person-outline", label: "Edit Profile" },
    { icon: "bookmark-outline", label: "Saved Posts" },
    { icon: "settings-outline", label: "Settings" },
    { icon: "shield-outline", label: "Privacy" },
    { icon: "help-circle-outline", label: "Help Centre" },
    { icon: "information-circle-outline", label: "About Muze" },
  ];

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{initial}</Text>
          </View>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.email}>{email}</Text>
          {joinDate ? (
            <View style={styles.joinRow}>
              <Ionicons
                name="calendar-outline"
                size={iw(14)}
                color={Colors.muted}
              />
              <Text style={styles.joinTxt}>Joined {joinDate}</Text>
            </View>
          ) : null}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>0</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>0</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>0</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>

          <Pressable style={styles.editBtn}>
            <Text style={styles.editBtnTxt}>Edit Profile</Text>
          </Pressable>
        </View>

        <View style={styles.menu}>
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { backgroundColor: Colors.inputBg },
              ]}
            >
              <Ionicons
                name={item.icon as any}
                size={iw(20)}
                color={Colors.label}
              />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons
                name="chevron-forward"
                size={iw(16)}
                color={Colors.muted}
              />
            </Pressable>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.signOutBtn,
            pressed && { backgroundColor: "#FEF0F0" },
          ]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={iw(20)} color="#E24B4A" />
          <Text style={styles.signOutTxt}>Sign Out</Text>
        </Pressable>

        <Text style={styles.version}>Muze v1.0.0</Text>

        <View style={{ height: Layout.vertical["3xl"] }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  profileHeader: {
    alignItems: "center",
    paddingTop: Layout.vertical["7xl"],
    paddingBottom: Layout.vertical.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: iw(80),
    height: iw(80),
    borderRadius: iw(40),
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Layout.vertical.md,
  },
  avatarTxt: {
    fontFamily: Typography.fonts.bold,
    fontSize: Typography.sizes["2xl"],
    color: Colors.white,
  },
  name: {
    fontFamily: Typography.fonts.bold,
    fontSize: Typography.sizes.xl,
    color: Colors.black,
    marginBottom: Layout.vertical.xxs,
  },
  email: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
    marginBottom: Layout.vertical.sm,
  },
  joinRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Layout.horizontal.xxs,
    marginBottom: Layout.vertical.lg,
  },
  joinTxt: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.xxs,
    color: Colors.muted,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Layout.vertical.lg,
    gap: Layout.horizontal.lg,
  },
  statItem: {
    alignItems: "center",
  },
  statNum: {
    fontFamily: Typography.fonts.bold,
    fontSize: Typography.sizes.lg,
    color: Colors.black,
  },
  statLabel: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.xxs,
    color: Colors.muted,
  },
  statDivider: {
    width: 1,
    height: iw(24),
    backgroundColor: Colors.border,
  },
  editBtn: {
    paddingHorizontal: Layout.horizontal["2xl"],
    paddingVertical: Layout.vertical.sm,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editBtnTxt: {
    fontFamily: Typography.fonts.semibold,
    fontSize: Typography.sizes.sm,
    color: Colors.black,
  },
  menu: {
    paddingTop: Layout.vertical.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Layout.horizontal.lg,
    paddingVertical: Layout.vertical.md,
    gap: Layout.horizontal.sm,
  },
  menuLabel: {
    flex: 1,
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.sm,
    color: Colors.label,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Layout.horizontal.lg,
    paddingVertical: Layout.vertical.md,
    gap: Layout.horizontal.sm,
    marginTop: Layout.vertical.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  signOutTxt: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.sm,
    color: "#E24B4A",
  },
  version: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.xxs,
    color: Colors.placeholder,
    textAlign: "center",
    marginTop: Layout.vertical.lg,
  },
});
