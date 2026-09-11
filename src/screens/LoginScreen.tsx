import React, { useState } from 'react';
import {
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput as RNTextInput,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Text } from '../components';
import { useTranslations } from '../localization/LocalizationProvider';
import { useAppTheme } from '../theme/ThemeProvider';
import { useLoginMutation } from '../hooks/useAuthMutations';
import { useExpoPushToken } from '../hooks/useExpoPushToken';

export default function LoginScreen() {
  const { t } = useTranslations('app');
  const { theme } = useAppTheme();
  const loginMutation = useLoginMutation();
  const { getExpoPushToken, isLoading: isFetchingExpoPushToken } = useExpoPushToken();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { height } = useWindowDimensions();
  const isSmallPhone = height < 760;

  const validate = (): boolean => {
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
    if (!validate()) return;

    const expoPushToken = await getExpoPushToken();
    loginMutation.mutate({
      email: email.trim(),
      password,
      device_push_token: expoPushToken ?? null,
    });
  };

  const apiError = loginMutation.error?.message ?? null;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.background}>
        <View style={styles.topBackgroundWrap}>
          <ImageBackground
            source={require('../assets/images/loginBackground.png')}
            style={styles.topBackground}
            resizeMode="cover"
          />
        </View>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            bounces={false}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.screenContent, isSmallPhone ? styles.screenContentCompact : null]}>
              <View style={styles.topSection}>
                <View style={styles.logoBox}>
                  <Image
                    source={require('../assets/images/loginLogo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>

                <View style={[styles.titleBlock, isSmallPhone ? styles.titleBlockCompact : null]}>
                  <View style={styles.welcomeRow}>
                    <View style={[styles.welcomeLine, { backgroundColor: '#B7D7A8' }]} />
                    <Text style={styles.welcomeText} weight="bold" color="#3E8D36">
                      {t('auth_welcome_back')}
                    </Text>
                    <View style={[styles.welcomeLine, { backgroundColor: '#B7D7A8' }]} />
                  </View>

                  <Text style={styles.mainTitle} weight="bold" color="#0F172A">
                    {t('auth_access_store')}
                  </Text>

                  <Text style={styles.subtitle} color="#6B7280">
                    {t('auth_login_subtitle')}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.formCard,
                  isSmallPhone ? styles.formCardCompact : null,
                  { backgroundColor: theme.colors.surface },
                ]}
              >
                <View style={styles.fieldBlock}>
                  <Text style={styles.fieldLabel} weight="bold" color="#0F172A">
                    {t('auth_email_placeholder')}
                  </Text>
                  <View style={[styles.inputRow, { borderColor: theme.colors.gray200 }]}>
                    <View style={styles.inputIconCell}>
                      <Feather name="mail" size={18} color="#5FA24E" />
                    </View>
                    <RNTextInput
                      placeholder={t('auth_email_placeholder')}
                      placeholderTextColor="#6B7280"
                      value={email}
                      onChangeText={(v) => {
                        setEmail(v);
                        if (emailError) setEmailError('');
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="next"
                      style={styles.input}
                    />
                  </View>
                  {emailError ? (
                    <Text variant="caption" color="#EF4444" style={styles.errorText}>
                      {emailError}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.fieldBlock}>
                  <Text style={styles.fieldLabel} weight="bold" color="#0F172A">
                    {t('auth_password_placeholder')}
                  </Text>
                  <View style={[styles.inputRow, { borderColor: theme.colors.gray200 }]}>
                    <View style={styles.inputIconCell}>
                      <Feather name="lock" size={18} color="#5FA24E" />
                    </View>
                    <RNTextInput
                      placeholder={t('auth_password_placeholder')}
                      placeholderTextColor="#6B7280"
                      value={password}
                      onChangeText={(v) => {
                        setPassword(v);
                        if (passwordError) setPasswordError('');
                      }}
                      secureTextEntry={!passwordVisible}
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                      style={styles.input}
                    />
                    <Pressable
                      onPress={() => setPasswordVisible((prev) => !prev)}
                      style={styles.trailingIconBtn}
                      hitSlop={8}
                    >
                      <Feather name={passwordVisible ? 'eye-off' : 'eye'} size={18} color="#6B7280" />
                    </Pressable>
                  </View>
                  {passwordError ? (
                    <Text variant="caption" color="#EF4444" style={styles.errorText}>
                      {passwordError}
                    </Text>
                  ) : null}
                </View>

                {apiError ? (
                  <Text variant="caption" color="#EF4444" style={styles.apiError}>
                    {apiError}
                  </Text>
                ) : null}

                <Pressable
                  onPress={handleLogin}
                  disabled={loginMutation.isPending || isFetchingExpoPushToken}
                  style={({ pressed }) => [
                    styles.loginBtn,
                    isSmallPhone ? styles.loginBtnCompact : null,
                    { backgroundColor: '#3E8D36' },
                    pressed && styles.pressed,
                    (loginMutation.isPending || isFetchingExpoPushToken) && styles.disabled,
                  ]}
                >
                  <Text style={styles.loginBtnText} weight="semiBold" color="#FFFFFF">
                    {t('auth_login')}
                  </Text>
                  <View style={styles.loginArrowWrap}>
                    <Feather name="arrow-right" size={20} color="#FFFFFF" />
                  </View>
                </Pressable>
              </View>

              <View style={styles.securityFooterRow}>
                <Image
                  source={require('../assets/images/privacy.png')}
                  style={styles.securityIcon}
                  resizeMode="contain"
                />
                <Text style={styles.securityNoteText} color="#6B7280">
                  {t('auth_data_protected')}
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  topBackgroundWrap: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '58%',
    height: '32%',
    overflow: 'hidden',
  },
  topBackground: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  screenContent: {
    paddingHorizontal: 20,
    paddingTop: 82,
    paddingBottom: 48,
    justifyContent: 'flex-start',
    minHeight: '100%',
  },
  screenContentCompact: {
    paddingTop: 70,
    paddingHorizontal: 16,
  },
  topSection: {
    alignItems: 'center',
  },
  logoBox: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  logo: {
    width: 72,
    height: 72,
  },
  titleBlock: {
    marginTop: 14,
    alignItems: 'center',
    gap: 8,
  },
  titleBlockCompact: {
    marginTop: 10,
    gap: 4,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  welcomeLine: {
    width: 54,
    height: 2,
    borderRadius: 2,
  },
  welcomeText: {
    fontSize: 15,
    lineHeight: 20,
  },
  mainTitle: {
    fontSize: 16,
    lineHeight: 21,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
  },
  formCard: {
    marginTop: 28,
    borderRadius: 26,
    padding: 18,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  formCardCompact: {
    marginTop: 18,
    padding: 14,
    gap: 10,
  },
  fieldBlock: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    lineHeight: 22,
  },
  inputRow: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  inputIconCell: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF7E9',
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    lineHeight: 20,
    color: '#111827',
  },
  trailingIconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    marginTop: 2,
    marginBottom: 2,
  },
  forgotText: {
    fontSize: 16,
    lineHeight: 22,
  },
  apiError: {
    marginTop: -2,
  },
  loginBtn: {
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  loginBtnCompact: {
    height: 50,
  },
  loginBtnText: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  loginArrowWrap: {
    position: 'absolute',
    right: 18,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  securityFooterRow: {
    marginTop: 'auto',
    paddingTop: 24,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  securityIcon: {
    width: 14,
    height: 14,
  },
  securityNoteText: {
    fontSize: 12,
    lineHeight: 16,
  },
  errorText: {
    marginTop: 1,
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.6,
  },
});
