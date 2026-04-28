import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

import ResultatInvalideScreen from './src/staff/screens/ResultatInvalideScreen';
import ResultatValideScreen from './src/staff/screens/ResultatValideScreen';
import SeancesDuJourScreen from './src/staff/screens/SeancesDuJourScreen';
import StaffFigmaPreviewScreen from './src/staff/screens/StaffFigmaPreviewScreen';
import StaffLoginScreen from './src/staff/screens/StaffLoginScreen';
import ValidationEntreesScreen from './src/staff/screens/ValidationEntreesScreen';
import VerificationManuelleScreen from './src/staff/screens/VerificationManuelleScreen';
import { store } from './src/staff/store/store';
import { staffTheme } from './src/staff/theme';

const Stack = createNativeStackNavigator();

const navTheme = {
  dark: true,
  colors: {
    primary: staffTheme.colors.accent,
    background: staffTheme.colors.bg,
    card: staffTheme.colors.card,
    text: staffTheme.colors.text,
    border: staffTheme.colors.border,
    notification: staffTheme.colors.accent,
  },
};

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer theme={navTheme}>
          <Stack.Navigator
            initialRouteName="StaffLogin"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: staffTheme.colors.bg },
            }}
          >
            <Stack.Screen name="StaffLogin" component={StaffLoginScreen} />
            <Stack.Screen name="SeancesDuJour" component={SeancesDuJourScreen} />
            <Stack.Screen name="ValidationEntrees" component={ValidationEntreesScreen} />
            <Stack.Screen name="ResultatValide" component={ResultatValideScreen} />
            <Stack.Screen name="ResultatInvalide" component={ResultatInvalideScreen} />
            <Stack.Screen name="VerificationManuelle" component={VerificationManuelleScreen} />
            <Stack.Screen name="Preview" component={StaffFigmaPreviewScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}
