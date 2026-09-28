import { globalStyles } from '@/styles/global';
import { Text, TouchableOpacity } from 'react-native';

interface StyledButtonProps {
  title: string;
  onPress: () => void;
  style?: object;
}

export const StyledButton = ({ title, onPress, style }: StyledButtonProps) => {
  return (
    <TouchableOpacity
      style={[globalStyles.button, style]}   
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={globalStyles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};