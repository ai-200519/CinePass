import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BrandHeader from '../components/BrandHeader';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import { staffTheme } from '../theme';

function formatSeats(seats = []) {
  if (!seats.length) return '-';
  return seats.map((seat) => `${seat.rangee}${seat.numero}`).join(', ');
}

export default function ResultatValideScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const session = route?.params?.session ?? {};
  const reservation = route?.params?.result?.reservation;
  const resultSession = reservation?.seance;

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
            backgroundColor: staffTheme.colors.success,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name="check" size={56} color={staffTheme.colors.text} />
        </View>

        <Text style={{ marginTop: 16, color: staffTheme.colors.text, fontWeight: '900', fontSize: 22 }}>
          ENTREE VALIDEE
        </Text>

        <Card style={{ width: '100%', marginTop: 16 }}>
          <Text style={{ color: staffTheme.colors.textSecondary, fontWeight: '700' }}>Movie</Text>
          <Text style={{ color: staffTheme.colors.text, fontWeight: '900', fontSize: 18, marginTop: 6 }}>
            {reservation?.film?.title ?? session.title ?? 'Film'}
          </Text>

          <Text style={{ color: staffTheme.colors.textSecondary, fontWeight: '700', marginTop: 14 }}>
            Seance
          </Text>
          <Text style={{ color: staffTheme.colors.text, fontWeight: '800', marginTop: 6 }}>
            {(session.time ?? '') + ' - ' + (resultSession?.salle ?? session.room ?? '')}
          </Text>

          <Text style={{ color: staffTheme.colors.textSecondary, fontWeight: '700', marginTop: 14 }}>
            Siege(s)
          </Text>
          <Text style={{ color: staffTheme.colors.text, fontWeight: '800', marginTop: 6 }}>
            {formatSeats(reservation?.sieges)}
          </Text>

          <Text style={{ color: staffTheme.colors.textSecondary, fontWeight: '700', marginTop: 14 }}>
            Ref
          </Text>
          <Text style={{ color: staffTheme.colors.text, fontWeight: '800', marginTop: 6 }}>
            {reservation?.reference ?? '-'}
          </Text>
        </Card>

        <View style={{ width: '100%', marginTop: 22 }}>
          <PrimaryButton
            title="Scanner le suivant"
            onPress={() => navigation.replace('ValidationEntrees', { session })}
            tone="green"
          />
        </View>
      </ScrollView>
    </View>
  );
}
