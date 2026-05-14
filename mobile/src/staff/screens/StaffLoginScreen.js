import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import { loginStaff, selectAuthStatus } from '../store/store';
import { staffTheme } from '../theme';

export default function StaffLoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const authStatus = useSelector(selectAuthStatus);

  const [email, setEmail] = useState('staff@cinepass.com');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      Alert.alert('Champs requis', 'Email et mot de passe sont requis.');
      return;
    }

    try {
      await dispatch(loginStaff({ email: normalizedEmail, password })).unwrap();
      navigation.replace('SeancesDuJour');
    } catch (error) {
      Alert.alert('Connexion impossible', error?.message ?? 'Identifiants invalides');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: staffTheme.colors.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <View
            style={{
              paddingHorizontal: staffTheme.spacing.screenPadH,
              paddingBottom: 18,
              width: '100%',
              maxWidth: 520,
              alignSelf: 'center',
            }}
          >
            <View style={{ alignItems: 'center', marginBottom: 18 }}>
              <Image
                source={require('../../../assets/logo.png')}
                style={{ width: 260, height: 92, resizeMode: 'contain' }}
              />
            </View>

            <Card style={{ padding: 20, minHeight: 250 }}>
              <Text style={{ color: staffTheme.colors.textSecondary, fontSize: 13, marginBottom: 8 }}>
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="staff@cinepass.com"
                placeholderTextColor={staffTheme.colors.textSecondary}
                style={{
                  height: 48,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: staffTheme.colors.border,
                  paddingHorizontal: 14,
                  color: staffTheme.colors.text,
                  backgroundColor: staffTheme.colors.card,
                }}
              />

              <Text
                style={{
                  color: staffTheme.colors.textSecondary,
                  fontSize: 13,
                  marginTop: 14,
                  marginBottom: 8,
                }}
              >
                Mot de passe
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor={staffTheme.colors.textSecondary}
                style={{
                  height: 48,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: staffTheme.colors.border,
                  paddingHorizontal: 14,
                  color: staffTheme.colors.text,
                  backgroundColor: staffTheme.colors.card,
                }}
              />

              <View style={{ marginTop: 18 }}>
                <PrimaryButton
                  title={authStatus === 'loading' ? 'Connexion...' : 'Se connecter'}
                  onPress={handleLogin}
                  disabled={authStatus === 'loading'}
                />
              </View>
            </Card>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
