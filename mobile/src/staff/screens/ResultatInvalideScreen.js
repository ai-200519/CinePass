import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BrandHeader from '../components/BrandHeader';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import { staffTheme } from '../theme';

export default function ResultatInvalideScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const result = route?.params?.result;
  const reservation = result?.reservation;
  const filmTitle = reservation?.film?.title;
  const seance = reservation?.seance;
  const seanceDate = seance?.dateHeure ? new Date(seance.dateHeure) : null;
  const seanceDateLabel = seanceDate
    ? seanceDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;
  const seanceTimeLabel = seanceDate
    ? seanceDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <View style={{ flex: 1, backgroundColor: staffTheme.colors.bg }}>
      <View style={{ paddingTop: 10 }}>
        <BrandHeader title="" subtitle="" />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: staffTheme.spacing.screenPadH,
          paddingTop: 28,
          paddingBottom: 24 + insets.bottom,
          alignItems: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            height: 96,
            width: 96,
            borderRadius: 96,
            backgroundColor: staffTheme.colors.accent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name="close" size={56} color={staffTheme.colors.text} />
        </View>

        <Text style={{ marginTop: 16, color: staffTheme.colors.text, fontWeight: '900', fontSize: 22 }}>

          {reservation ? (
            <>
              <Text style={{ color: staffTheme.colors.textSecondary, fontWeight: '700', marginTop: 14 }}>
                Billet pour
              </Text>
              <Text style={{ color: staffTheme.colors.text, fontWeight: '800', marginTop: 6 }}>
                {filmTitle ?? 'Film'}
              </Text>

              {seanceDateLabel || seanceTimeLabel || seance?.salle ? (
                <Text style={{ color: staffTheme.colors.textSecondary, fontWeight: '700', marginTop: 14 }}>
                  Seance
                </Text>
              ) : null}

              {seanceDateLabel ? (
                <Text style={{ color: staffTheme.colors.text, fontWeight: '800', marginTop: 6 }}>
                  {seanceDateLabel}
                </Text>
              ) : null}
              {seanceTimeLabel || seance?.salle ? (
                <Text style={{ color: staffTheme.colors.text, fontWeight: '800', marginTop: 6 }}>
                  {[seanceTimeLabel, seance?.salle].filter(Boolean).join(' • ')}
                </Text>
              ) : null}

              {reservation?.statut ? (
                <>
                  <Text style={{ color: staffTheme.colors.textSecondary, fontWeight: '700', marginTop: 14 }}>
                    Statut
                  </Text>
                  <Text style={{ color: staffTheme.colors.text, fontWeight: '800', marginTop: 6 }}>
                    {reservation.statut}
                  </Text>
                </>
              ) : null}
            </>
          ) : null}
          BILLET INVALIDE
        </Text>

        <Card
          style={{
            width: '100%',
            borderColor: staffTheme.colors.accent,
            backgroundColor: staffTheme.colors.card,
            marginTop: 16,
          }}
        >
          <Text style={{ color: staffTheme.colors.textSecondary, fontWeight: '700' }}>Raison</Text>
          <Text style={{ color: staffTheme.colors.text, fontWeight: '900', fontSize: 16, marginTop: 8 }}>
            {result?.reason ?? 'Reservation non valide'}
          </Text>

          {result?.reference ? (
            <>
              <Text style={{ color: staffTheme.colors.textSecondary, fontWeight: '700', marginTop: 14 }}>
                Ref
              </Text>
              <Text style={{ color: staffTheme.colors.text, fontWeight: '800', marginTop: 6 }}>
                {result.reference}
              </Text>
            </>
          ) : null}
        </Card>

        <View style={{ width: '100%', marginTop: 22 }}>
          <PrimaryButton title="Reessayer" variant="outline" onPress={() => navigation.goBack()} />
        </View>
      </ScrollView>
    </View>
  );
}
