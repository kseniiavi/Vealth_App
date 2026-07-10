import { globalStyles } from '@/styles/global';
import { ScrollView, Text } from 'react-native';

export default function ProfileScreen() {
  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>Profile</Text>
    </ScrollView>
  );
}