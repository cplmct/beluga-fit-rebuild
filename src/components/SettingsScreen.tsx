import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  name: string;
  email: string;
  height: string;
  weight: string;
  gender: string;
  age: string;
}

export function SettingsScreen() {
  const navigation = useNavigation();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState<Profile>({
    id: '',
    name: '',
    email: '',
    height: '',
    weight: '',
    gender: '',
    age: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile({
          id: data.id,
          name: data.name || '',
          email: data.email || '',
          height: data.height?.toString() || '',
          weight: data.weight?.toString() || '',
          gender: data.gender || '',
          age: data.age?.toString() || '',
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name || null,
          email: profile.email || null,
          height: profile.height ? parseFloat(profile.height) : null,
          weight: profile.weight ? parseFloat(profile.weight) : null,
          gender: profile.gender || null,
          age: profile.age ? parseInt(profile.age) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setSuccess('Profile updated successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleDeleteAccount = () => {
    navigation.navigate('DeleteAccount' as never);
  };

  const handlePrivacyPolicy = () => {
    navigation.navigate('PrivacyPolicy' as never);
  };

  const handleTermsOfUse = () => {
    navigation.navigate('TermsOfUse' as never);
  };

  const handleSupport = () => {
    navigation.navigate('Support' as never);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Profile & Settings</Text>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {success ? (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>{success}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor="#94a3b8"
            value={profile.name}
            onChangeText={(text) => setProfile({ ...profile, name: text })}
            editable={!saving}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor="#94a3b8"
            value={profile.email}
            onChangeText={(text) => setProfile({ ...profile, email: text })}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!saving}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your age"
            placeholderTextColor="#94a3b8"
            value={profile.age}
            onChangeText={(text) => setProfile({ ...profile, age: text })}
            keyboardType="numeric"
            editable={!saving}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender</Text>
          <TextInput
            style={styles.input}
            placeholder="Male, Female, Other"
            placeholderTextColor="#94a3b8"
            value={profile.gender}
            onChangeText={(text) => setProfile({ ...profile, gender: text })}
            editable={!saving}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Height (inches)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your height"
            placeholderTextColor="#94a3b8"
            value={profile.height}
            onChangeText={(text) => setProfile({ ...profile, height: text })}
            keyboardType="numeric"
            editable={!saving}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Weight (lbs)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your weight"
            placeholderTextColor="#94a3b8"
            value={profile.weight}
            onChangeText={(text) => setProfile({ ...profile, weight: text })}
            keyboardType="numeric"
            editable={!saving}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Profile</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Legal</Text>

        <TouchableOpacity style={styles.listRow} onPress={handlePrivacyPolicy} activeOpacity={0.7}>
          <Text style={styles.listRowText}>Privacy Policy</Text>
          <Text style={styles.listRowArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.listRow} onPress={handleTermsOfUse} activeOpacity={0.7}>
          <Text style={styles.listRowText}>Terms of Use</Text>
          <Text style={styles.listRowArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.listRow} onPress={handleSupport} activeOpacity={0.7}>
          <Text style={styles.listRowText}>Support & Contact</Text>
          <Text style={styles.listRowArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity style={styles.listRow} onPress={handleDeleteAccount} activeOpacity={0.7}>
          <Text style={styles.listRowDestructive}>Delete Account</Text>
          <Text style={styles.listRowArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.8}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
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
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f8fc',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  successContainer: {
    backgroundColor: '#d1fae5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#059669',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 15,
    color: '#0f172a',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
  },
  listRowText: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '500',
  },
  listRowDestructive: {
    fontSize: 15,
    color: '#dc2626',
    fontWeight: '500',
  },
  listRowArrow: {
    fontSize: 20,
    color: '#94a3b8',
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  signOutButton: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '600',
  },
});
