import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../components';
import { useTranslations } from '../localization/LocalizationProvider';
import { useAppTheme } from '../theme/ThemeProvider';
import { useLoginMutation } from '../hooks/useAuthMutations';
import { useExpoPushToken } from '../hooks/useExpoPushToken';

type FocusedField = 'email' | 'password' | null;

export default function LoginScreen() {
  const { t } = useTranslations('app');
  const { theme } = useAppTheme();
  const { height } = useWindowDimensions();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const compact = height < 740 || keyboardVisible;
  const loginMutation = useLoginMutation();
  const { getExpoPushToken, isLoading: isFetchingExpoPushToken } = useExpoPushToken();
  const passwordRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [focusedField, setFocusedField] = useState<FocusedField>(null);
  const isSubmitting = loginMutation.isPending || isFetchingExpoPushToken;

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  const revealForm = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
  };

  useEffect(() => {
    if (keyboardVisible) revealForm();
  }, [keyboardVisible]);

  const validate = () => {
    let valid = true;
    if (!email.trim()) {
      setEmailError(t('auth_email_required'));
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError(t('auth_email_invalid'));
      valid = false;
    } else {
      setEmailError('');
    }
    if (!password) {
      setPasswordError(t('auth_password_required'));
      valid = false;
    } else {
      setPasswordError('');
    }
    return valid;
  };

  const handleLogin = async () => {
    if (isSubmitting || !validate()) return;
    const expoPushToken = await getExpoPushToken();
    loginMutation.mutate({
      email: email.trim(),
      password,
      device_push_token: expoPushToken ?? null,
    });
  };

  const inputBorder = (field: FocusedField, hasError: boolean) =>
    hasError ? theme.colors.red500 : focusedField === field ? theme.colors.loginAccent : theme.colors.gray200;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.scrollContent, compact && styles.scrollContentCompact]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text weight="bold" color={theme.colors.loginAccent} style={styles.wordmark}>{t('auth_brand_name')}</Text>
            {!keyboardVisible ? (
              <Image
                source={require('../assets/images/storeLoginHero.png')}
                style={[styles.heroImage, compact && styles.heroImageCompact]}
                resizeMode="contain"
              />
            ) : null}

            <View style={styles.intro}>
              <Text weight="bold" color={theme.colors.gray900} style={styles.title}>{t('auth_access_store')}</Text>
              <Text color={theme.colors.gray600} style={styles.subtitle}>{t('auth_login_subtitle')}</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text weight="semiBold" color={theme.colors.gray900} style={styles.label}>{t('auth_email_placeholder')}</Text>
                <View style={[styles.inputWrap, { backgroundColor: theme.colors.surface, borderColor: inputBorder('email', Boolean(emailError)) }]}>
                  <Feather name="mail" size={19} color={theme.colors.loginAccent} />
                  <TextInput
                    value={email}
                    onChangeText={(value) => { setEmail(value); if (emailError) setEmailError(''); }}
                    onFocus={() => { setFocusedField('email'); revealForm(); }}
                    onBlur={() => setFocusedField(null)}
                    placeholder={t('auth_email_placeholder')}
                    placeholderTextColor={theme.colors.gray500}
                    keyboardType="email-address"
                    autoComplete="email"
                    textContentType="emailAddress"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    style={[styles.input, { color: theme.colors.gray900 }]}
                  />
                </View>
                {emailError ? <Text variant="caption" color={theme.colors.red500}>{emailError}</Text> : null}
              </View>

              <View style={styles.field}>
                <Text weight="semiBold" color={theme.colors.gray900} style={styles.label}>{t('auth_password_placeholder')}</Text>
                <View style={[styles.inputWrap, { backgroundColor: theme.colors.surface, borderColor: inputBorder('password', Boolean(passwordError)) }]}>
                  <Feather name="lock" size={19} color={theme.colors.loginAccent} />
                  <TextInput
                    ref={passwordRef}
                    value={password}
                    onChangeText={(value) => { setPassword(value); if (passwordError) setPasswordError(''); }}
                    onFocus={() => { setFocusedField('password'); revealForm(); }}
                    onBlur={() => setFocusedField(null)}
                    placeholder={t('auth_password_placeholder')}
                    placeholderTextColor={theme.colors.gray500}
                    autoComplete="password"
                    textContentType="password"
                    secureTextEntry={!passwordVisible}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                    style={[styles.input, { color: theme.colors.gray900 }]}
                  />
                  <Pressable
                    onPress={() => setPasswordVisible((visible) => !visible)}
                    accessibilityRole="button"
                    accessibilityLabel={passwordVisible ? t('auth_hide_password') : t('auth_show_password')}
                    hitSlop={8}
                    style={styles.eyeButton}
                  >
                    <Feather name={passwordVisible ? 'eye-off' : 'eye'} size={19} color={theme.colors.gray600} />
                  </Pressable>
                </View>
                {passwordError ? <Text variant="caption" color={theme.colors.red500}>{passwordError}</Text> : null}
              </View>

              {loginMutation.error?.message ? (
                <Text variant="caption" color={theme.colors.red500}>{loginMutation.error.message}</Text>
              ) : null}

              <Pressable
                onPress={handleLogin}
                disabled={isSubmitting}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.loginButton,
                  { backgroundColor: theme.colors.loginAccent },
                  (pressed || isSubmitting) && styles.buttonMuted,
                ]}
              >
                <Text weight="bold" color={theme.colors.gray900} style={styles.buttonLabel}>
                  {isSubmitting ? t('auth_login_loading') : t('auth_login')}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 30 },
  scrollContentCompact: { paddingTop: 10, paddingBottom: 18 },
  content: { width: '100%', maxWidth: 460, alignSelf: 'center' },
  wordmark: { fontSize: 25, lineHeight: 32, letterSpacing: -0.7 },
  heroImage: { width: '100%', height: 205, marginTop: 4 },
  heroImageCompact: { height: 145 },
  intro: { marginTop: 12, gap: 6 },
  title: { fontSize: 30, lineHeight: 37, letterSpacing: -0.7 },
  subtitle: { fontSize: 15, lineHeight: 22 },
  form: { marginTop: 28, gap: 18 },
  field: { gap: 8 },
  label: { fontSize: 14, lineHeight: 20 },
  inputWrap: { minHeight: 56, borderWidth: 1, borderRadius: 14, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 },
  input: { flex: 1, minHeight: 52, paddingVertical: 0, fontSize: 15 },
  eyeButton: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  loginButton: { minHeight: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  buttonLabel: { fontSize: 16, lineHeight: 22 },
  buttonMuted: { opacity: 0.7 },
});
