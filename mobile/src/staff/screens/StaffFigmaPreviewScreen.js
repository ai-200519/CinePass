import { ScrollView, View } from 'react-native';
import { staffTheme } from '../theme';
import ResultatInvalideScreen from './ResultatInvalideScreen';
import ResultatValideScreen from './ResultatValideScreen';
import SeancesDuJourScreen from './SeancesDuJourScreen';
import ValidationEntreesScreen from './ValidationEntreesScreen';
import VerificationManuelleScreen from './VerificationManuelleScreen';

const FRAME_W = 390;
const FRAME_H = 844;

function Frame({ children }) {
  return (
    <View
      style={{
        width: FRAME_W,
        height: FRAME_H,
        backgroundColor: staffTheme.colors.bg,
        borderRadius: 28,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: staffTheme.colors.border,
      }}
    >
      {children}
    </View>
  );
}

export default function StaffFigmaPreviewScreen({ navigation }) {
  // Route mocks for screens that rely on params
  const mockSession = {
    title: 'Apocalypse Stellaire',
    time: '20:45',
    room: 'Salle 2',
    used: 47,
    total: 80,
  };

  const nav = navigation ?? {
    navigate: () => {},
    goBack: () => {},
    replace: () => {},
  };

  return (
    <View style={{ flex: 1, backgroundColor: staffTheme.colors.bg, padding: 16 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ marginRight: 16 }}>
            <Frame>
              <SeancesDuJourScreen navigation={nav} />
            </Frame>
          </View>
          <View style={{ marginRight: 16 }}>
            <Frame>
              <ValidationEntreesScreen navigation={nav} route={{ params: { session: mockSession } }} />
            </Frame>
          </View>
          <View style={{ marginRight: 16 }}>
            <Frame>
              <ResultatValideScreen navigation={nav} route={{ params: { session: mockSession } }} />
            </Frame>
          </View>
          <View style={{ marginRight: 16 }}>
            <Frame>
              <ResultatInvalideScreen navigation={nav} />
            </Frame>
          </View>
          <Frame>
            <VerificationManuelleScreen navigation={nav} route={{ params: { session: mockSession } }} />
          </Frame>
        </View>
      </ScrollView>
    </View>
  );
}
