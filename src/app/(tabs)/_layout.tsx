import { colors } from '@/styles/global';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.surface,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='home' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='vet_assist'
        options={{
          title: 'Vet Assistant',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='file-tray-full-outline' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='ai'
        options={{
          title: 'AI Assistant',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='medical' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='person' size={size} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}
