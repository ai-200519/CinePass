import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BrandHeader from '../components/BrandHeader';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import ProgressBar from '../components/ProgressBar';
import { staffTheme } from '../theme';

export default function ValidationEntreesScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const session = route?.params?.session ?? {
    title: 'Apocalypse Stellaire',
    time: '20:45',
    room: 'Salle 2',
    used: 47,
    total: 80,
  };
  const [ref, setRef] = useState('');

  const occupancy = useMemo(() => {
    const ratio = session.used / session.total;
    return {
      ratio,
      pct: Math.round(ratio * 100),
    };
  }, [session.total, session.used]);

  return (
    <View style={{ flex: 1, backgroundColor: staffTheme.colors.bg }}>
      <View style={{ paddingTop: 10 }}>
        <BrandHeader
          title="Validation des entrées"
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
            <Text style={{ color: staffTheme.colors.text, fontWeight: '800', flex: 1, paddingRight: 12 }}>
              {session.title} • {session.time} • {session.room}
            </Text>
            <Pressable onPress={() => navigation.goBack()}>
              <Text style={{ color: staffTheme.colors.accent, fontWeight: '800' }}>Changer</Text>
            </Pressable>
          </Card>
        </View>

        <View style={{ marginBottom: staffTheme.spacing.stackGap }}>
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="people" size={22} color={staffTheme.colors.accent} />
                <View style={{ width: 10 }} />
                <View>
                  <Text style={{ color: staffTheme.colors.textSecondary, fontWeight: '600' }}>
                    Entrées validées
                  </Text>
                  <Text
                    style={{
                      color: staffTheme.colors.text,
                      fontSize: 22,
                      fontWeight: '900',
                      marginTop: 6,
                    }}
                  >
                    {session.used} / {session.total}
                  </Text>
                </View>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: staffTheme.colors.textSecondary, fontWeight: '600' }}>
                  Taux de remplissage
                </Text>
                <Text
                  style={{
                    color: staffTheme.colors.accent,
                    fontSize: 22,
                    fontWeight: '900',
                    marginTop: 6,
                  }}
                >
                  {occupancy.pct}%
                </Text>
              </View>
            </View>

            <ProgressBar value01={occupancy.ratio} style={{ marginTop: 14 }} height={6} />
          </Card>
        </View>

        <View style={{ marginBottom: staffTheme.spacing.stackGap }}>
          <Card>
            <View
              style={{
                height: 260,
                borderRadius: staffTheme.radius.card,
                borderWidth: 2,
                borderStyle: 'dashed',
                borderColor: staffTheme.colors.accent,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons name="qrcode-scan" size={66} color={staffTheme.colors.accent} />
              <Text style={{ marginTop: 12, color: staffTheme.colors.textSecondary, fontWeight: '700' }}>
                Positionnez le QR code ici
              </Text>
            </View>
          </Card>
        </View>

        <View style={{ marginBottom: staffTheme.spacing.stackGap }}>
          <PrimaryButton
            title="Simuler un scan"
            icon={<MaterialCommunityIcons name="qrcode" size={18} color={staffTheme.colors.text} />}
            onPress={() => navigation.navigate('ResultatValide', { session })}
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 4,
            marginBottom: staffTheme.spacing.stackGap,
          }}
        >
          <View style={{ flex: 1, height: 1, backgroundColor: staffTheme.colors.border }} />
          <Text style={{ paddingHorizontal: 10, color: staffTheme.colors.textSecondary, fontWeight: '700' }}>
            ou
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: staffTheme.colors.border }} />
        </View>

        <Card>
          <TextInput
            value={ref}
            onChangeText={setRef}
            placeholder="Saisir une référence (ex: CIN-2026-XXXX)"
            placeholderTextColor={staffTheme.colors.textSecondary}
            style={{
              height: 50,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: staffTheme.colors.border,
              paddingHorizontal: 14,
              color: staffTheme.colors.text,
              backgroundColor: staffTheme.colors.card,
            }}
          />

          <View style={{ marginTop: 14 }}>
            <PrimaryButton
              title="Valider manuellement"
              onPress={() => navigation.navigate('VerificationManuelle', { session, ref })}
            />
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
