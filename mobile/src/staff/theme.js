export const staffTheme = {
  colors: {
    bg: '#111111',
    card: '#1E1E1E',
    border: '#2A2A2A',
    text: '#FFFFFF',
    textSecondary: '#888888',
    accent: '#E8192C',
    success: '#1DB954',
    track: '#2A2A2A',
  },
  radius: {
    card: 16,
    button: 50,
    pill: 999,
  },
  spacing: {
    screenPadH: 16,
    stackGap: 12,
  },
};

export const shadowGlowRed = {
  shadowColor: staffTheme.colors.accent,
  shadowOpacity: 0.4,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 0 },
  elevation: 8,
};
