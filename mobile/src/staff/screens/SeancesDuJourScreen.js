import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useMemo } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import BrandHeader from '../components/BrandHeader';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import ProgressBar from '../components/ProgressBar';
import {
  fetchTodaySeances,
  selectSeancesError,
  selectSeancesStatus,
  selectSelectedSessionId,
  selectSession,
  selectSessions,
} from '../store/store';
import { shadowGlowRed, staffTheme } from '../theme';

function SessionCard({ session, selected, onSelect }) {
  const ratio = session.total > 0 ? session.used / session.total : 0;

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
            {session.used} / {session.total} entrees
          </Text>
          <Text style={{ color: staffTheme.colors.textSecondary, marginTop: 6, fontWeight: '700' }}>
            {session.reserved} places reservees
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
          title={selected ? 'Selectionne' : 'Selectionner'}
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
  const status = useSelector(selectSeancesStatus);
  const error = useSelector(selectSeancesError);
  const selectedId = useSelector(selectSelectedSessionId);

  const selected = useMemo(
    () => sessions.find((item) => item.id === selectedId) ?? sessions[0] ?? null,
    [sessions, selectedId],
  );

  useEffect(() => {
    dispatch(fetchTodaySeances());
  }, [dispatch]);

  useEffect(() => {
    if (status === 'failed' && error) {
      Alert.alert('Chargement impossible', error);
    }
  }, [error, status]);

  return (
    <View style={{ flex: 1, backgroundColor: staffTheme.colors.bg }}>
      <View style={{ paddingTop: 10 }}>
        <BrandHeader title="Seances du jour" />
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
              Seances programmees
            </Text>
          </View>

          <Text style={{ marginTop: 12, color: staffTheme.colors.text, fontSize: 26, fontWeight: '900' }}>
            {sessions.length} seance{sessions.length > 1 ? 's' : ''}
          </Text>

          <ProgressBar value01={sessions.length > 0 ? 1 : 0} style={{ marginTop: 12 }} height={6} />
        </Card>

        {status === 'loading' ? (
          <View style={{ paddingVertical: 24 }}>
            <ActivityIndicator color={staffTheme.colors.accent} />
          </View>
        ) : null}

        {status !== 'loading' && sessions.length === 0 ? (
          <Card>
            <Text style={{ color: staffTheme.colors.text, fontWeight: '800', textAlign: 'center' }}>
              Aucune seance aujourd'hui
            </Text>
          </Card>
        ) : null}

        {sessions.map((session) => (
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
          title="Commencer la validation"
          disabled={!selected}
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
