import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';
import { useDispatch } from 'react-redux';
import BrandHeader from '../components/BrandHeader';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import { login } from '../store/store';
import { staffTheme } from '../theme';

export default function StaffLoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={{ flex: 1, backgroundColor: staffTheme.colors.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ paddingTop: 10 }}>
          <BrandHeader title="Connexion staff" subtitle="Connectez-vous pour valider les entrées" />
        </View>

        <View style={{ paddingHorizontal: staffTheme.spacing.screenPadH, marginTop: 18 }}>
          <View style={{ marginBottom: 12 }}>
            <Card>
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

            <Text style={{ color: staffTheme.colors.textSecondary, fontSize: 13, marginTop: 14, marginBottom: 8 }}>
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

            <View style={{ marginTop: 16 }}>
              <PrimaryButton
                title="Se connecter"
                onPress={() => {
                  dispatch(login({ email }));
                  navigation.replace('SeancesDuJour');
                }}
              />
            </View>
            </Card>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
