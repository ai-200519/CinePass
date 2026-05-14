import { useMemo, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import BrandHeader from '../components/BrandHeader';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import { validateTicket } from '../store/store';
import { staffTheme } from '../theme';

const recentRefs = ['CP-2026-4872', 'CP-2026-9120', 'CP-2026-3341', 'CP-2026-5608'];

export default function VerificationManuelleScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const session = route?.params?.session;
  const initialRef = route?.params?.ref ?? '';
  const [ref, setRef] = useState(initialRef);
  const [loading, setLoading] = useState(false);

  const sessionLabel = useMemo(() => {
    if (!session) return 'Seance non selectionnee';
    return `${session.title} - ${session.time} - ${session.room}`;
  }, [session]);

  const handleVerify = async () => {
    const normalized = (ref || '').trim().toUpperCase();
    if (!normalized) {
      Alert.alert('Reference requise', 'Saisissez une reference de reservation.');
      return;
    }

    setLoading(true);
    try {
      const result = await dispatch(
        validateTicket({
          sessionId: session?.id_seance,
          reference: normalized,
        }),
      ).unwrap();

      if (result.valid) {
        navigation.navigate('ResultatValide', { session, result });
        return;
      }

      navigation.navigate('ResultatInvalide', { result });
    } catch (error) {
      Alert.alert('Validation impossible', error?.message ?? 'Erreur API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: staffTheme.colors.bg }}>
      <View style={{ paddingTop: 10 }}>
        <BrandHeader title="Verification manuelle" />
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
            <Text style={{ color: staffTheme.colors.text, fontWeight: '800', flex: 1, paddingRight: 12 }}>
              {sessionLabel}
            </Text>
            <Text
              onPress={() => navigation.goBack()}
              style={{ color: staffTheme.colors.accent, fontWeight: '800' }}
            >
              Changer
            </Text>
          </Card>
        </View>

        <View style={{ marginBottom: staffTheme.spacing.stackGap }}>
          <Card>
            <Text style={{ color: staffTheme.colors.textSecondary, fontWeight: '700' }}>
              Reference de reservation
            </Text>
            <TextInput
              value={ref}
              onChangeText={setRef}
              placeholder="CP-2026-XXXX"
              placeholderTextColor={staffTheme.colors.textSecondary}
              autoCapitalize="characters"
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
              Recentes
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
          title={loading ? 'Verification...' : 'Verifier la reference'}
          disabled={loading}
          onPress={handleVerify}
        />
      </ScrollView>
    </View>
  );
}
