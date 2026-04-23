import { Tabs } from "expo-router";
import { Home, MessageCircle } from "lucide-react-native";

import { useTheme } from "@/context/theme";
import { Typography } from "@/constants/typography";
import { Layout } from "@/constants/layout";
import { useUnreadCount } from "@/hooks/useUnreadCount";

export default function TabsLayout() {
  const { colors } = useTheme();
  const unreadCount = useUnreadCount();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: Layout.vertical["7xl"],
          paddingBottom: Layout.vertical.sm,
          paddingTop: Layout.vertical.sm,
        },
        tabBarLabelStyle: {
          fontFamily: Typography.fonts.dm.medium,
          fontSize: Typography.sizes.xxs,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} strokeWidth={1.75} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, size }) => (
            <MessageCircle size={size} color={color} strokeWidth={1.75} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
    </Tabs>
  );
}
