import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export function RecoveryLinkScreen() {
  const { recoveryLinkState, requestAnotherResetLink, cancelRecovery } = useAuth();
  const processing = recoveryLinkState.status === 'processing';
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f8fc' }}>
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 24 }}>Beluga Fit</Text>
        <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 16 }}>
            {processing ? 'Opening reset link…' : 'Unable to open reset link'}
          </Text>
          {processing ? <ActivityIndicator accessibilityLabel="Opening reset link" /> : (
            <>
              <Text testID="recovery-link-error" accessibilityRole="alert"
                style={{ color: '#b91c1c', lineHeight: 22, marginBottom: 20 }}>
                {recoveryLinkState.message}
              </Text>
              <TouchableOpacity testID="request-another-reset-link" accessibilityRole="button"
                onPress={requestAnotherResetLink}
                style={{ backgroundColor: '#2563eb', borderRadius: 12, padding: 16 }}>
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>Request another reset link</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity testID="recovery-link-cancel" accessibilityRole="button"
            disabled={processing} onPress={cancelRecovery} style={{ padding: 16, opacity: processing ? 0.5 : 1 }}>
            <Text style={{ color: '#2563eb', textAlign: 'center', fontWeight: '600' }}>Cancel / Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
