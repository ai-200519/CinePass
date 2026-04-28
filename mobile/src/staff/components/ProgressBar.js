import { View } from 'react-native';
import { staffTheme } from '../theme';

export default function ProgressBar({ value01, style, height = 6 }) {
  const clamped = Math.max(0, Math.min(1, value01));

  return (
    <View
      style={[
        {
          height,
          borderRadius: 999,
          backgroundColor: staffTheme.colors.track,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <View
        style={{
          height: '100%',
          width: `${Math.round(clamped * 100)}%`,
          backgroundColor: staffTheme.colors.accent,
        }}
      />
    </View>
  );
}
