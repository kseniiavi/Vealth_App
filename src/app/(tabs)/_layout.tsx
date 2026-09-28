import { colors, globalStyles } from '@/styles/global';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: globalStyles.header,        // apply global header style
        headerTitleStyle: globalStyles.title,
        headerShadowVisible: false,
        tabBarStyle: {                
          backgroundColor: colors.bar,
          borderTopColor: colors.surface,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.surface,
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
          title: 'Teeth Analysis',
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
