import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export function ResetPasswordScreen() {
  const { updatePassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleUpdate = async () => {
    const trimmed = password.trim();

    if (!trimmed) {
      setError('Please enter a new password.');
      return;
    }
    if (trimmed.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (trimmed !== confirm.trim()) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    const { error: updateError } = await updatePassword(trimmed);

    setLoading(false);

    if (updateError) {
      setError(updateError.message || 'Something went wrong. Please try again.');
    } else {
      setDone(true);
      // updatePassword() sets isPasswordRecovery = false in AuthContext,
      // which causes App.tsx to re-render and navigate to the main app.
      // The done state shows a brief success message before that happens.
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Brand ── */}
          <View style={styles.brand}>
            <View style={styles.logoMark}>
              <Text style={styles.logoLetter}>B</Text>
            </View>
            <Text style={styles.appName}>Beluga Fit</Text>
          </View>

          <View style={styles.card}>
            {done ? (
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <Text style={styles.successIconText}>✓</Text>
                </View>
                <Text style={styles.successTitle}>Password updated</Text>
                <Text style={styles.successBody}>
                  Your password has been changed successfully. Taking you to the app…
                </Text>
                <ActivityIndicator color="#2563eb" style={{ marginTop: 16 }} />
              </View>
            ) : (
              <>
                <Text style={styles.cardTitle}>Set new password</Text>
                <Text style={styles.cardSubtitle}>
                  Choose a new password for your account. It must be at least 8 characters.
                </Text>

                {error ? (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>New password</Text>
                  <TextInput
                    style={[styles.input, passwordFocused && styles.inputFocused]}
                    placeholder="At least 8 characters"
                    placeholderTextColor="#94a3b8"
                    value={password}
                    onChangeText={(t) => { setPassword(t); setError(''); }}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    secureTextEntry
                    textContentType="newPassword"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                    autoFocus
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Confirm password</Text>
                  <TextInput
                    style={[
                      styles.input,
                      confirmFocused && styles.inputFocused,
                      confirm.length > 0 && confirm !== password && styles.inputError,
                    ]}
                    placeholder="Repeat your new password"
                    placeholderTextColor="#94a3b8"
                    value={confirm}
                    onChangeText={(t) => { setConfirm(t); setError(''); }}
                    onFocus={() => setConfirmFocused(true)}
                    onBlur={() => setConfirmFocused(false)}
                    secureTextEntry
                    textContentType="newPassword"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                  {confirm.length > 0 && confirm !== password ? (
                    <Text style={styles.fieldHint}>Passwords do not match</Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                  onPress={handleUpdate}
                  disabled={loading}
                  activeOpacity={0.88}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Update Password</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f7f8fc',
  },
  root: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 48,
    justifyContent: 'center',
  },

  brand: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoMark: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoLetter: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 21,
    marginBottom: 20,
  },

  errorBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: '#dc2626',
    fontWeight: '500',
    lineHeight: 18,
  },

  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 7,
    letterSpacing: 0.1,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#0f172a',
  },
  inputFocused: {
    borderColor: '#2563eb',
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#fca5a5',
  },
  fieldHint: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 5,
    marginLeft: 2,
  },

  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  successContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  successIconText: {
    fontSize: 24,
    color: '#059669',
    fontWeight: '700',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  successBody: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
});
