import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SaveStatus } from '../hooks/useSaveStatus';

interface Props {
  status: SaveStatus;
}

/**
 * Minimal inline save-confidence indicator.
 *
 * Renders nothing when status is 'idle' — no visual noise during normal use.
 * Shows a small colored dot + micro text for all other states:
 *
 *   saving  — spinner + "Saving…"        (neutral / in-progress)
 *   saved   — green dot + "Saved"         (auto-dismissed after 2.5 s by hook)
 *   error   — red dot + "Couldn't save"   (persists until next action)
 *   offline — amber dot + "No connection" (persists until next action)
 *
 * Place it close to the save action (e.g. just below a save button or above
 * a footer) so it reads as belonging to that specific operation.
 */
export function SaveStatusBadge({ status }: Props) {
  if (status === 'idle') return null;

  const config: Record<Exclude<SaveStatus, 'idle'>, { label: string; color: string }> = {
    saving:  { label: 'Saving…',        color: '#94a3b8' },
    saved:   { label: 'Saved',           color: '#16a34a' },
    error:   { label: "Couldn't save",   color: '#dc2626' },
    offline: { label: 'No connection',   color: '#d97706' },
  };

  const { label, color } = config[status];

  return (
    <View style={styles.row}>
      {status === 'saving' ? (
        <ActivityIndicator size="small" color={color} style={styles.spinner} />
      ) : (
        <View style={[styles.dot, { backgroundColor: color }]} />
      )}
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  spinner: {
    marginRight: 6,
    transform: [{ scale: 0.7 }],
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
});
