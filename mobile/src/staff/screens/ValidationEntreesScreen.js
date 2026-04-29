import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera/next';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BrandHeader from '../components/BrandHeader';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import ProgressBar from '../components/ProgressBar';
import { staffTheme } from '../theme';

export default function ValidationEntreesScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState(false);
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
            <View style={styles.cameraFrame}>
              {!permission ? null : permission.granted ? (
                isFocused ? (
                  <CameraView
                    style={StyleSheet.absoluteFill}
                    facing="back"
                    onBarcodeScanned={(result) => {
                      if (hasScanned) return;
                      setHasScanned(true);
                      navigation.navigate('ResultatValide', {
                        session,
                        scan: { type: result.type, data: result.data },
                      });
                    }}
                    barcodeScannerSettings={{
                      barcodeTypes: ['qr'],
                    }}
                  />
                ) : null
              ) : (
                <View style={styles.permissionWrap}>
                  <Text style={styles.permissionTitle}>Caméra non autorisée</Text>
                  <Text style={styles.permissionText}>
                    Autorisez l'accès à la caméra pour scanner les QR codes.
                  </Text>
                  <View style={{ marginTop: 12, width: '100%' }}>
                    <PrimaryButton title="Autoriser la caméra" onPress={requestPermission} />
                  </View>
                </View>
              )}

              <View pointerEvents="none" style={styles.overlay}>
                <View style={styles.overlayInner}>
                  <MaterialCommunityIcons name="qrcode-scan" size={66} color={staffTheme.colors.accent} />
                  <Text style={styles.overlayText}>Positionnez le QR code ici</Text>
                </View>
              </View>
            </View>
          </Card>
        </View>

        <View style={{ marginBottom: staffTheme.spacing.stackGap }}>
          <PrimaryButton
            title="Simuler un scan"
            icon={<MaterialCommunityIcons name="qrcode" size={18} color={staffTheme.colors.text} />}
            onPress={() => {
              setHasScanned(true);
              navigation.navigate('ResultatValide', { session, scan: { type: 'qr', data: 'MOCK-QR' } });
            }}
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

const styles = StyleSheet.create({
  cameraFrame: {
    height: 260,
    borderRadius: staffTheme.radius.card,
    overflow: 'hidden',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: staffTheme.colors.accent,
    backgroundColor: staffTheme.colors.card,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayText: {
    marginTop: 12,
    color: staffTheme.colors.textSecondary,
    fontWeight: '700',
  },
  permissionWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  permissionTitle: {
    color: staffTheme.colors.text,
    fontWeight: '900',
    fontSize: 16,
  },
  permissionText: {
    marginTop: 8,
    color: staffTheme.colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
});
