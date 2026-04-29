import { Image, StatusBar, StyleSheet, View } from 'react-native';
import { staffTheme } from '../theme';

export default function BrandHeader() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={staffTheme.colors.bg} />
      <Image source={require('../../../assets/logo.png')} style={styles.logo} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: staffTheme.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 6,
    paddingHorizontal: staffTheme.spacing.screenPadH,
  },
  logo: {
    width: 240,
    height: 80,
    resizeMode: 'contain',
  },
});
