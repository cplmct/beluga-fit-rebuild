import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

const DELETED_ITEMS = [
  'Your profile and personal information',
  'All workout history and session logs',
  'Body measurement records',
  'Saved workout plans and templates',
  'All other data associated with your account',
];

export function DeleteAccountScreen() {
  const navigation = useNavigation();
  const { deleteAccount } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = () => {
    Alert.alert(
      'Final Confirmation',
      'This will permanently delete your account and all associated data. There is no way to recover it.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete My Account',
          style: 'destructive',
          onPress: performDeletion,
        },
      ]
    );
  };

  const performDeletion = async () => {
    setDeleting(true);
    setError('');

    const { error: deleteError } = await deleteAccount();

    if (deleteError) {
      setError(deleteError.message || 'Something went wrong. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.warningCard}>
        <View style={styles.warningIconContainer}>
          <Text style={styles.warningIcon}>!</Text>
        </View>
        <Text style={styles.warningTitle}>This action is permanent</Text>
        <Text style={styles.warningBody}>
          Deleting your account cannot be undone. You will lose access immediately and your data cannot be recovered.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>The following will be permanently deleted</Text>
        {DELETED_ITEMS.map((item, index) => (
          <View key={index} style={styles.listRow}>
            <View style={styles.bullet} />
            <Text style={styles.listItem}>{item}</Text>
          </View>
        ))}
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]}
          onPress={handleDelete}
          disabled={deleting}
          activeOpacity={0.8}
        >
          {deleting ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.deleteButtonText}>Deleting account...</Text>
            </View>
          ) : (
            <Text style={styles.deleteButtonText}>Permanently Delete Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={deleting}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText}>Cancel — Keep My Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fc',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 48,
  },
  warningCard: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  warningIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  warningIcon: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  warningBody: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 21,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#dc2626',
    marginTop: 7,
    marginRight: 12,
    flexShrink: 0,
  },
  listItem: {
    fontSize: 15,
    color: '#0f172a',
    lineHeight: 22,
    flex: 1,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    lineHeight: 20,
  },
  actionsSection: {
    gap: 12,
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    backgroundColor: '#f87171',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '500',
  },
});
