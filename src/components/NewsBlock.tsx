import { colors } from '@/styles/global';
import { StyleSheet, Text, View } from 'react-native';

type NewsCardProps = {
  label: string;
  text: string; 
};

export default function NewsCard({ label, text = colors.surface }: NewsCardProps) {
  return (
    <View style={[styles.card,]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.header,
    borderRadius: 12,
    padding: 16,
    height: 200,
    marginBottom: 16,
    
  },
  label: {
    fontSize: 16,
    color: colors.background,
    textAlign: 'center',
  },
  text: {
    marginTop: 8,
    fontSize: 14,
    color: colors.background,
    textAlign: 'left',
  }
});