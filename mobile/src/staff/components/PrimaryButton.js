import { Pressable, Text, View } from 'react-native';
import { shadowGlowRed, staffTheme } from '../theme';

export default function PrimaryButton({
  title,
  icon,
  onPress,
  variant = 'solid',
  disabled = false,
  tone = 'red',
}) {
  const solid = variant === 'solid';
  const accentColor = tone === 'green' ? staffTheme.colors.success : staffTheme.colors.accent;
  const glow = tone === 'green'
    ? {
        shadowColor: accentColor,
        shadowOpacity: 0.25,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 0 },
        elevation: 8,
      }
    : shadowGlowRed;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        {
          width: '100%',
          borderRadius: staffTheme.radius.button,
          paddingVertical: 16,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          backgroundColor: solid ? accentColor : 'transparent',
          borderWidth: solid ? 0 : 1,
          borderColor: accentColor,
          opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
        },
        solid ? glow : null,
      ]}
    >
      {icon ? <View style={{ marginTop: 1, marginRight: 10 }}>{icon}</View> : null}
      <Text style={{ color: staffTheme.colors.text, fontSize: 16, fontWeight: '800' }}>{title}</Text>
    </Pressable>
  );
}
