import { globalStyles } from '@/styles/global';
import { ScrollView, Text } from 'react-native';

export default function VetAssistantScreen() {
  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>Vet Assistant</Text>
    </ScrollView>
  );
}