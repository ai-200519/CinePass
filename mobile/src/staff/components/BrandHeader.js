import { StatusBar, Text, View } from 'react-native';
import { staffTheme } from '../theme';

export default function BrandHeader({ title, subtitle }) {
  return (
    <View style={{ paddingHorizontal: staffTheme.spacing.screenPadH }}>
      <StatusBar barStyle="light-content" backgroundColor={staffTheme.colors.bg} />

         <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 8 }}>
        <Text style={{ color: staffTheme.colors.accent, fontSize: 16, fontWeight: '700' }}>🎬</Text>
           <View style={{ width: 10 }} />
        <Text style={{ fontSize: 18, fontWeight: '800', color: staffTheme.colors.text }}>
          Cine
          <Text style={{ color: staffTheme.colors.accent }}>Pass</Text>
        </Text>
      </View>

      {title ? (
        <Text
          style={{
            marginTop: 14,
            fontSize: 30,
            fontWeight: '800',
            color: staffTheme.colors.text,
            lineHeight: 36,
          }}
        >
          {title}
        </Text>
      ) : null}

      {subtitle ? (
        <Text style={{ marginTop: 6, color: staffTheme.colors.textSecondary, fontSize: 14 }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
