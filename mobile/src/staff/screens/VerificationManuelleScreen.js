import { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BrandHeader from '../components/BrandHeader';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import { staffTheme } from '../theme';

const recentRefs = ['CIN-2026-4872', 'CIN-2026-9120', 'CIN-2026-3341', 'CIN-2026-5608'];

export default function VerificationManuelleScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const session = route?.params?.session;
  const initialRef = route?.params?.ref ?? '';
  const [ref, setRef] = useState(initialRef);

  const sessionLabel = useMemo(() => {
    if (!session) return 'Inception • 14:30 • Salle 2';
    return `${session.title} • ${session.time} • ${session.room}`;
  }, [session]);

  return (
    <View style={{ flex: 1, backgroundColor: staffTheme.colors.bg }}>
      <View style={{ paddingTop: 10 }}>
        <BrandHeader
          title="Vérification manuelle"
          subtitle="Scannez ou saisissez une référence de réservation"
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: staffTheme.spacing.screenPadH,
          paddingTop: 16,
          paddingBottom: 24 + insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: staffTheme.spacing.stackGap }}>
          <Card style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: staffTheme.colors.text, fontWeight: '800' }}>{sessionLabel}</Text>
            <Text style={{ color: staffTheme.colors.accent, fontWeight: '800' }}>Changer</Text>
          </Card>
        </View>

        <View style={{ marginBottom: staffTheme.spacing.stackGap }}>
          <Card>
          <Text style={{ color: staffTheme.colors.textSecondary, fontWeight: '700' }}>
            Référence de réservation
          </Text>
          <TextInput
            value={ref}
            onChangeText={setRef}
            placeholder="CIN-2026-XXXX"
            placeholderTextColor={staffTheme.colors.textSecondary}
            style={{
              marginTop: 10,
              height: 52,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: staffTheme.colors.accent,
              paddingHorizontal: 14,
              color: staffTheme.colors.text,
              backgroundColor: staffTheme.colors.card,
              fontWeight: '800',
            }}
          />

          <Text style={{ marginTop: 14, color: staffTheme.colors.textSecondary, fontWeight: '700' }}>
            Récentes
          </Text>
          <View style={{ marginTop: 10 }}>
            {recentRefs.map((value, index) => (
              <Text
                key={value}
                onPress={() => setRef(value)}
                style={{
                  color: staffTheme.colors.text,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  marginBottom: index === recentRefs.length - 1 ? 0 : 10,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: staffTheme.colors.border,
                  backgroundColor: staffTheme.colors.card,
                  fontWeight: '700',
                }}
              >
                {value}
              </Text>
            ))}
          </View>
          </Card>
        </View>

        <PrimaryButton
          title="Vérifier la référence"
          onPress={() => {
            const normalized = (ref || '').trim().toUpperCase();
            if (normalized === 'CIN-2026-4872') {
              navigation.navigate('ResultatValide', { session });
              return;
            }
            navigation.navigate('ResultatInvalide');
          }}
        />
      </ScrollView>
    </View>
  );
}
