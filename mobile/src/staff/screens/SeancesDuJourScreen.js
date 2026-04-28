import { MaterialIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import BrandHeader from '../components/BrandHeader';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import ProgressBar from '../components/ProgressBar';
import { selectSelectedSessionId, selectSession, selectSessions } from '../store/store';
import { shadowGlowRed, staffTheme } from '../theme';

function SessionCard({ session, selected, onSelect }) {
  const ratio = session.used / session.total;

  return (
    <Card
      style={[
        {
          padding: 16,
          marginBottom: staffTheme.spacing.stackGap,
        },
        selected
          ? {
              borderColor: staffTheme.colors.accent,
              ...shadowGlowRed,
            }
          : null,
      ]}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: staffTheme.colors.text, fontSize: 18, fontWeight: '800' }}>
            {session.title}
          </Text>
          <Text style={{ color: staffTheme.colors.textSecondary, marginTop: 10 }}>{session.room}</Text>
          <Text style={{ color: staffTheme.colors.text, marginTop: 10, fontWeight: '700' }}>
            {session.used} / {session.total} places
          </Text>
        </View>

        <View
          style={{
            marginLeft: 12,
            alignSelf: 'flex-start',
            backgroundColor: staffTheme.colors.accent,
            borderRadius: staffTheme.radius.pill,
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          <Text style={{ color: staffTheme.colors.text, fontWeight: '800' }}>{session.time}</Text>
        </View>
      </View>

      <ProgressBar value01={ratio} style={{ marginTop: 14 }} height={6} />

      <View style={{ marginTop: 14 }}>
        <PrimaryButton
          title={selected ? 'Sélectionné' : 'Sélectionner'}
          variant={selected ? 'solid' : 'outline'}
          onPress={onSelect}
        />
      </View>
    </Card>
  );
}

export default function SeancesDuJourScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const sessions = useSelector(selectSessions);
  const selectedId = useSelector(selectSelectedSessionId);

  const selected = useMemo(
    () => sessions.find((item) => item.id === selectedId) ?? sessions[0],
    [sessions, selectedId],
  );

  return (
    <View style={{ flex: 1, backgroundColor: staffTheme.colors.bg }}>
      <View style={{ paddingTop: 10 }}>
        <BrandHeader title="Séances du jour" subtitle="Lundi 28 Avril 2026" />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: staffTheme.spacing.screenPadH,
          paddingTop: 16,
          paddingBottom: 24 + insets.bottom + 92,
        }}
        showsVerticalScrollIndicator={false}
      >
         <Card style={{ marginBottom: staffTheme.spacing.stackGap }}>
           <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialIcons name="people" size={22} color={staffTheme.colors.accent} />
             <View style={{ width: 10 }} />
            <Text style={{ color: staffTheme.colors.textSecondary, fontWeight: '600' }}>
              Séances programmées
            </Text>
          </View>

          <Text style={{ marginTop: 12, color: staffTheme.colors.text, fontSize: 26, fontWeight: '900' }}>
            4 séances
          </Text>

          <ProgressBar value01={0.7} style={{ marginTop: 12 }} height={6} />
        </Card>

        {sessions.slice(0, 3).map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            selected={session.id === selectedId}
            onSelect={() => dispatch(selectSession(session.id))}
          />
        ))}
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: staffTheme.spacing.screenPadH,
          paddingBottom: Math.max(insets.bottom, 12),
          paddingTop: 12,
          backgroundColor: staffTheme.colors.bg,
        }}
      >
        <PrimaryButton
          title="Commencer la validation  →"
          onPress={() =>
            navigation.navigate('ValidationEntrees', {
              session: selected,
            })
          }
        />
      </View>
    </View>
  );
}
