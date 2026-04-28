import { View } from 'react-native';
import { staffTheme } from '../theme';

export default function Card({ children, style }) {
  return (
    <View
      style={[
        {
          backgroundColor: staffTheme.colors.card,
          borderColor: staffTheme.colors.border,
          borderWidth: 1,
          borderRadius: staffTheme.radius.card,
          padding: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
